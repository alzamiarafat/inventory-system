const express = require("express");
const cors = require("cors");
const { z } = require("zod");
const { HttpError } = require("./lib/httpErrors");
const { createRouter } = require("./routes");

function createApp({ io }) {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.use((req, _res, next) => {
    req.io = io;
    next();
  });

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api", createRouter());

  // 404
  app.use((_req, _res, next) => next(new HttpError(404, "Not Found")));

  // error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Invalid request",
        details: err.flatten(),
      });
    }
    const status =
      err.status && Number.isInteger(err.status) ? err.status : 500;
    return res.status(status).json({
      error: err.error || "SERVER_ERROR",
      message: err.message || "Server error",
      details: err.details,
    });
  });

  return app;
}

module.exports = { createApp };
