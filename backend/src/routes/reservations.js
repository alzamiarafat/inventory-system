const express = require("express");
const { asyncHandler } = require("../lib/asyncHandler");
const reservationController = require("../controllers/reservationController");

const router = express.Router();

router.get("/active", asyncHandler(reservationController.listActiveReservations));
router.post(
  "/:reservationId/purchase",
  asyncHandler(reservationController.purchaseReservation)
);

module.exports = router;
