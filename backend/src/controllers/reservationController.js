const { z } = require("zod");
const { badRequest } = require("../lib/httpErrors");
const reservationService = require("../services/reservationService");

const usernameSchema = z.object({
  username: z.string().min(1),
});

async function listActiveReservations(req, res) {
  const { username } = usernameSchema.parse(req.query);
  const reservations = await reservationService.listActiveReservations(username);
  res.json({ reservations });
}

async function purchaseReservation(req, res) {
  const { username } = usernameSchema.parse(req.body);
  const reservationId = Number.parseInt(req.params.reservationId, 10);
  if (Number.isNaN(reservationId)) throw badRequest("Invalid reservationId");

  let result;
  try {
    result = await reservationService.purchaseReservation(reservationId, username);
  } catch (err) {
    if (err.details?.reason === "reservation_expired") {
      req.io.emit("dropsChanged", err.details);
    }
    throw err;
  }

  req.io.emit("dropsChanged", {
    dropIds: [result.dropId],
    reason: "purchased",
  });
  res.status(201).json({ purchase: result.purchase });
}

module.exports = {
  listActiveReservations,
  purchaseReservation,
};
