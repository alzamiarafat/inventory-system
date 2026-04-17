const { Op } = require("sequelize");
const { sequelize, Reservation, Drop } = require("../models");

async function expireBatch({ batchSize }) {
  return sequelize.transaction(async (t) => {
    // Lock a small batch so multiple workers can coexist safely.
    const expired = await Reservation.findAll({
      where: {
        status: "ACTIVE",
        expiresAt: { [Op.lte]: new Date() },
      },
      limit: batchSize,
      lock: t.LOCK.UPDATE,
      skipLocked: true,
      transaction: t,
    });

    if (expired.length === 0) return [];

    const recovered = [];
    for (const r of expired) {
      await r.update({ status: "EXPIRED" }, { transaction: t });
      await Drop.increment(
        { availableStock: 1 },
        { where: { id: r.dropId }, transaction: t }
      );
      recovered.push({ reservationId: r.id, dropId: r.dropId });
    }

    return recovered;
  });
}

function startExpiryWorker({ io, intervalMs = 1000, batchSize = 50 } = {}) {
  let stopped = false;

  async function tick() {
    if (stopped) return;
    try {
      const recovered = await expireBatch({ batchSize });
      if (recovered.length > 0) {
        // Broadcast a conservative "dropsChanged" so clients can refetch.
        const dropIds = [...new Set(recovered.map((r) => r.dropId))];
        io.emit("dropsChanged", { dropIds, reason: "reservation_expired" });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("expiry worker error", e);
    } finally {
      setTimeout(tick, intervalMs);
    }
  }

  setTimeout(tick, intervalMs);

  return () => {
    stopped = true;
  };
}

module.exports = { startExpiryWorker };
