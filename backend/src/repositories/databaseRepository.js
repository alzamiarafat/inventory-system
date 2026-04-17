const { sequelize } = require("../../models");

function transaction(callback) {
  return sequelize.transaction(callback);
}

module.exports = {
  transaction,
};
