const { z } = require("zod");
const { badRequest } = require("../lib/httpErrors");
const dropService = require("../services/dropService");

const createDropSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  totalStock: z.number().int().min(0),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
});

const reserveDropSchema = z.object({
  username: z.string().min(1),
});

async function listActiveDrops(_req, res) {
  const drops = await dropService.listActiveDrops();
  res.json({ drops });
}

async function createDrop(req, res) {
  const body = createDropSchema.parse(req.body);
  const drop = await dropService.createDrop(body);

  req.io.emit("dropsChanged", { dropIds: [drop.id], reason: "drop_created" });
  res.status(201).json({ drop });
}

async function reserveDrop(req, res) {
  const { username } = reserveDropSchema.parse(req.body);
  const dropId = Number.parseInt(req.params.dropId, 10);
  if (Number.isNaN(dropId)) throw badRequest("Invalid dropId");

  const result = await dropService.reserveDrop(dropId, username);

  req.io.emit("dropsChanged", {
    dropIds: [result.drop.id],
    reason: "reserved",
  });

  res.status(201).json({
    reservation: {
      id: result.reservation.id,
      dropId: result.reservation.dropId,
      userId: result.reservation.userId,
      status: result.reservation.status,
      expiresAt: result.reservation.expiresAt,
    },
    drop: {
      id: result.drop.id,
      availableStock: result.drop.availableStock,
    },
  });
}

module.exports = {
  listActiveDrops,
  createDrop,
  reserveDrop,
};
