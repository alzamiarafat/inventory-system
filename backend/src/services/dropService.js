const { badRequest, conflict, notFound } = require("../lib/httpErrors");
const databaseRepository = require("../repositories/databaseRepository");
const dropRepository = require("../repositories/dropRepository");
const reservationRepository = require("../repositories/reservationRepository");
const userRepository = require("../repositories/userRepository");

function normalizeUsername(username) {
  const trimmed = username.trim();
  if (!trimmed) throw badRequest("username is required");
  return trimmed;
}

function listActiveDrops() {
  return dropRepository.listActiveWithLatestPurchasers();
}

function createDrop(body) {
  if (body.endsAt && body.startsAt && body.endsAt <= body.startsAt) {
    throw badRequest("endsAt must be after startsAt");
  }

  return databaseRepository.transaction((transaction) => {
    const startsAt = body.startsAt ?? new Date();

    return dropRepository.createDrop(
      {
        name: body.name,
        price: body.price,
        totalStock: body.totalStock,
        availableStock: body.totalStock,
        startsAt,
        endsAt: body.endsAt ?? null,
      },
      { transaction }
    );
  });
}

function reserveDrop(dropId, username) {
  const normalizedUsername = normalizeUsername(username);

  return databaseRepository.transaction(async (transaction) => {
    const user = await userRepository.findOrCreateByUsername(normalizedUsername, {
      transaction,
    });
    const now = new Date();

    const { count, drop } = await dropRepository.decrementAvailableStockForActiveDrop(
      dropId,
      now,
      { transaction }
    );

    if (count === 0) {
      const dropExists = await dropRepository.findById(dropId, { transaction });
      if (!dropExists) throw notFound("Drop not found");
      throw conflict("Out of stock (or drop not active)");
    }

    const reservation = await reservationRepository.createReservation(
      {
        userId: user.id,
        dropId: drop.id,
        status: "ACTIVE",
        expiresAt: new Date(now.getTime() + 60 * 1000),
      },
      { transaction }
    );

    return { reservation, drop, user };
  });
}

module.exports = {
  listActiveDrops,
  createDrop,
  reserveDrop,
};
