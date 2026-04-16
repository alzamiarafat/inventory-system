## Limited Edition Sneaker Drop (Real-Time)

### Stack
- **Frontend**: React (Vite) + Tailwind + Socket.io client
- **Backend**: Node.js + Express + Socket.io
- **DB**: Postgres
- **ORM**: Sequelize

### How to run locally
Start Postgres:

```bash
cd limited-sneaker-drop
docker compose up -d
```

Backend:

```bash
cp backend/.env.example backend/.env
cd backend
npm install
npm run db:migrate
npm run db:seed:all
npm run dev
```

Frontend:

```bash
cp frontend/.env.example frontend/.env
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Core architecture notes

### Atomic reservation + no overselling
- Reservation endpoint: `POST /api/drops/:dropId/reserve`
- The backend does an **atomic conditional update** inside a DB transaction:
  - `UPDATE Drops SET availableStock = availableStock - 1 WHERE id = ? AND availableStock > 0 ... RETURNING *`
- Because the decrement happens in a single guarded statement, **100 concurrent requests for the last unit** result in **only one success** (the rest get `409`).

### 60-second expiration + stock recovery
- Each reservation is created with an `expiresAt = now + 60s` and `status = ACTIVE`.
- A small in-process worker (`backend/src/expiryWorker.js`) runs every ~1s:
  - selects expired ACTIVE reservations in a transaction using row locks (`FOR UPDATE SKIP LOCKED`)
  - marks them `EXPIRED`
  - increments `Drops.availableStock` by 1 (stock recovery)
  - broadcasts a Socket.io event so dashboards refresh instantly

### Purchase flow (must be reserved)
- Purchase endpoint: `POST /api/reservations/:reservationId/purchase`
- Requires the purchasing `username` to match the reservation’s `userId`, and the reservation must be `ACTIVE` + unexpired.
- On success it creates a `Purchase` row and marks the reservation `CONVERTED`.

### Drop activity feed (top 3 purchasers per drop)
- Dashboard data endpoint: `GET /api/drops/active`
- It returns each active drop plus `latestPurchasers` (top 3), computed in SQL using a window function.

### Useful endpoints
- **List active drops (with top 3 purchasers)**: `GET /api/drops/active`
- **Create a new drop**: `POST /api/drops`
  - body: `{ "name": "...", "priceCents": 22000, "totalStock": 100, "startsAt": "2026-04-16T00:00:00Z" }`
- **Reserve**: `POST /api/drops/:dropId/reserve`
  - body: `{ "username": "alice" }`
- **Purchase**: `POST /api/reservations/:reservationId/purchase`
  - body: `{ "username": "alice" }`

### Real-time behavior
- Backend emits `dropsChanged` via Socket.io on:
  - successful reservation
  - successful purchase
  - reservation expiration / stock recovery
  - drop creation
- Frontend listens for `dropsChanged` and refetches `GET /api/drops/active`.

