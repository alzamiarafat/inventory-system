const { badRequest, conflict, forbidden, notFound } = require("../lib/httpErrors");
const databaseRepository = require("../repositories/databaseRepository");
const dropRepository = require("../repositories/dropRepository");
const purchaseRepository = require("../repositories/purchaseRepository");
const reservationRepository = require("../repositories/reservationRepository");
const userRepository = require("../repositories/userRepository");

function normalizeUsername(username) {
  const trimmed = username.trim();
  if (!trimmed) throw badRequest("username is required");
  return trimmed;
}

async function mustGetUser(username, { transaction } = {}) {
  const user = await userRepository.findByUsername(normalizeUsername(username), {
    transaction,
  });
  if (!user) throw notFound("User not found");
  return user;
}

async function listActiveReservations(username) {
  const user = await userRepository.findByUsername(normalizeUsername(username));
  if (!user) return [];

  return reservationRepository.findActiveByUserId(user.id, new Date());
}

function purchaseReservation(reservationId, username) {
  const normalizedUsername = normalizeUsername(username);

  return databaseRepository.transaction(async (transaction) => {
    const reservation = await reservationRepository.findByIdForUpdate(
      reservationId,
      transaction
    );
    if (!reservation) throw notFound("Reservation not found");

    const user = await userRepository.findByUsername(normalizedUsername, {
      transaction,
    });
    if (!user || reservation.userId !== user.id) {
      throw forbidden("Reservation is not yours");
    }

    const now = new Date();
    if (reservation.status !== "ACTIVE") throw conflict("Reservation is not active");
    if (reservation.expiresAt <= now) {
      await reservationRepository.markExpired(reservation, { transaction });
      await dropRepository.incrementAvailableStock(reservation.dropId, {
        transaction,
      });
      return { expired: true, dropId: reservation.dropId };
    }

    const drop = await dropRepository.findById(reservation.dropId, { transaction });
    if (!drop) throw notFound("Drop not found");

    const purchase = await purchaseRepository.createPurchase(
      {
        userId: user.id,
        dropId: drop.id,
        reservationId: reservation.id,
        price: drop.price,
      },
      { transaction }
    );

    await reservationRepository.markConverted(reservation, { transaction });

    return { purchase, dropId: drop.id, expired: false };
  }).then((result) => {
    if (result.expired) {
      throw conflict("Reservation expired", {
        dropIds: [result.dropId],
        reason: "reservation_expired",
      });
    }

    return result;
  });
}

module.exports = {
  listActiveReservations,
  purchaseReservation,
};
