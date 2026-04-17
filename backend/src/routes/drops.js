const express = require("express");
const { asyncHandler } = require("../lib/asyncHandler");
const dropController = require("../controllers/dropController");

const router = express.Router();

router.get("/active", asyncHandler(dropController.listActiveDrops));
router.post("/", asyncHandler(dropController.createDrop));
router.post("/:dropId/reserve", asyncHandler(dropController.reserveDrop));

module.exports = router;
