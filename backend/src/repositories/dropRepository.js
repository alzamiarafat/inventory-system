const { Op, QueryTypes } = require("sequelize");
const { sequelize, Drop } = require("../../models");

function listActiveWithLatestPurchasers() {
  return sequelize.query(
    `
    WITH ranked AS (
      SELECT
        p."dropId",
        u."username",
        p."createdAt" AS "purchasedAt",
        ROW_NUMBER() OVER (PARTITION BY p."dropId" ORDER BY p."createdAt" DESC) AS rn
      FROM "Purchases" p
      JOIN "Users" u ON u.id = p."userId"
    )
    SELECT
      d.id,
      d."name",
      d."price",
      d."totalStock",
      d."availableStock",
      d."startsAt",
      d."endsAt",
      COALESCE(
        json_agg(
          json_build_object(
            'username', r."username",
            'purchasedAt', r."purchasedAt"
          )
          ORDER BY r."purchasedAt" DESC
        ) FILTER (WHERE r.rn <= 3),
        '[]'::json
      ) AS "latestPurchasers"
    FROM "Drops" d
    LEFT JOIN ranked r
      ON r."dropId" = d.id
      AND r.rn <= 3
    WHERE d."startsAt" <= now()
      AND (d."endsAt" IS NULL OR d."endsAt" > now())
    GROUP BY d.id
    ORDER BY d."startsAt" DESC, d.id DESC;
    `,
    { type: QueryTypes.SELECT }
  );
}

function createDrop(attrs, { transaction } = {}) {
  return Drop.create(attrs, { transaction });
}

function findById(id, { transaction } = {}) {
  return Drop.findByPk(id, { transaction });
}

async function decrementAvailableStockForActiveDrop(dropId, now, { transaction } = {}) {
  const [count, rows] = await Drop.update(
    { availableStock: sequelize.literal('"availableStock" - 1') },
    {
      where: {
        id: dropId,
        availableStock: { [Op.gt]: 0 },
        startsAt: { [Op.lte]: now },
        [Op.or]: [{ endsAt: null }, { endsAt: { [Op.gt]: now } }],
      },
      returning: true,
      transaction,
    }
  );

  return { count, drop: rows[0] };
}

function incrementAvailableStock(dropId, { transaction } = {}) {
  return Drop.increment(
    { availableStock: 1 },
    { where: { id: dropId }, transaction }
  );
}

module.exports = {
  listActiveWithLatestPurchasers,
  createDrop,
  findById,
  decrementAvailableStockForActiveDrop,
  incrementAvailableStock,
};
