const express = require("express");
const dropsRouter = require("./drops");
const reservationsRouter = require("./reservations");

function createRouter() {
  const router = express.Router();

  router.use("/drops", dropsRouter);
  router.use("/reservations", reservationsRouter);

  return router;
}

module.exports = { createRouter };
