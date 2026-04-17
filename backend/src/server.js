require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const { createApp } = require("./app");
const { sequelize } = require("../models");
const { startExpiryWorker } = require("./expiryWorker");

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function main() {
  await sequelize.authenticate();

  const httpServer = http.createServer();
  const io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN || true, credentials: true },
  });

  const app = createApp({ io });
  // Prevent Express from also responding to engine.io's long-polling requests.
  // Otherwise both handlers can write to the same response (ERR_HTTP_HEADERS_SENT).
  httpServer.on("request", (req, res) => {
    if (req.url && req.url.startsWith("/socket.io")) return;
    app(req, res);
  });

  io.on("connection", (socket) => {
    socket.emit("connected", { ok: true });
  });

  startExpiryWorker({ io });

  httpServer.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`backend listening on :${PORT}`);
  });
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
