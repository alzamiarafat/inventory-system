import { createApiClient } from "./client";

const api = createApiClient();

function mapReservationsByDropId(reservations = []) {
  const map = {};
  for (const reservation of reservations) {
    map[reservation.dropId] = reservation;
  }
  return map;
}

export async function fetchActiveDrops() {
  const { data } = await api.get("/api/drops/active");
  return data.drops || [];
}

export async function fetchActiveReservations(username) {
  if (!username.trim()) return {};

  const { data } = await api.get("/api/reservations/active", {
    params: { username },
  });

  return mapReservationsByDropId(data.reservations);
}

export async function reserveDrop(dropId, username) {
  const { data } = await api.post(`/api/drops/${dropId}/reserve`, { username });
  return data;
}

export async function purchaseReservation(reservationId, username) {
  const { data } = await api.post(`/api/reservations/${reservationId}/purchase`, {
    username,
  });
  return data;
}
