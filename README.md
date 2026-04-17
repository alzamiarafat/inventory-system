## Limited Edition Sneaker Drop (Real-Time)

### Stack

- **Frontend**: React (Vite) + Tailwind + Socket.io client
- **Backend**: Node.js + Express + Socket.io
- **DB**: Postgres
- **ORM**: Sequelize

### How to run locally

Clone the repository:

```bash
git clone git@github.com:alzamiarafat/inventory-system.git
cd inventory-system
```

Fresh project setup:

```bash
cp .env.example .env
docker compose up -d
```

Docker reads database credentials from the root `.env` file. `.env.example` is only a template, and `.env` is ignored by Git.

That starts:

- Postgres
- Backend on `http://localhost:4000`
- Frontend on `http://localhost:5173`

The backend container automatically runs:

```bash
npm run db:migrate
npm run db:seed:all
```

Open `http://localhost:5173`.

To reset the database and start from fresh seed data:

```bash
docker compose down -v
docker compose up -d
```

If you change dependencies or Dockerfiles, rebuild with:

```bash
docker compose up -d --build
```

### Database setup

The SQL schema is managed with Sequelize migrations in `backend/migrations`.
Docker runs migrations and seeders automatically before starting the backend:

```bash
npm run db:migrate
npm run db:seed:all
```

Main tables:

- `Users`
- `Drops`
- `Reservations`
- `Purchases`

### Architecture choice

The backend uses a **controller-service-repository architecture**:

- **Controller**: handles request validation and response.
- **Service**: handles business logic and transactions.
- **Repository**: handles Sequelize database queries.

The 60-second reservation uses a **temporary hold mechanism**:

- When a user reserves an item, stock is reduced by 1.
- A reservation is created with `expiresAt = now + 60 seconds`.
- If the user purchases in time, the reservation becomes `CONVERTED`.
- If the user does not purchase, the reservation becomes `EXPIRED`.

Stock recovery uses an **in-process expiration worker**. It runs every second, finds expired reservations, returns the stock, and sends a Socket.io event so all clients update.

### Concurrency

Overselling is prevented with a **PostgreSQL atomic update**.

The app decreases stock only when `availableStock > 0`, and this check/update happens in one database operation inside a transaction. So if many users try to reserve the last item at the same time, only one request succeeds.

The expiration worker also uses row locking, so the same expired reservation is not recovered twice.
