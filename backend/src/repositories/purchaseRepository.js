const { Purchase } = require("../../models");

function createPurchase(attrs, { transaction } = {}) {
  return Purchase.create(attrs, { transaction });
}

module.exports = {
  createPurchase,
};
