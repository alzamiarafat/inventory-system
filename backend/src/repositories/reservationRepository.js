const { Op } = require("sequelize");
const { Reservation } = require("../../models");

function createReservation(attrs, { transaction } = {}) {
  return Reservation.create(attrs, { transaction });
}

function findActiveByUserId(userId, now) {
  return Reservation.findAll({
    where: {
      userId,
      status: "ACTIVE",
      expiresAt: { [Op.gt]: now },
    },
    attributes: ["id", "dropId", "userId", "status", "expiresAt", "createdAt"],
    order: [["createdAt", "DESC"]],
  });
}

function findByIdForUpdate(id, transaction) {
  return Reservation.findByPk(id, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
}

function markExpired(reservation, { transaction } = {}) {
  return reservation.update({ status: "EXPIRED" }, { transaction });
}

function markConverted(reservation, { transaction } = {}) {
  return reservation.update({ status: "CONVERTED" }, { transaction });
}

module.exports = {
  createReservation,
  findActiveByUserId,
  findByIdForUpdate,
  markExpired,
  markConverted,
};
