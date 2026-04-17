const { User } = require("../../models");

function findByUsername(username, { transaction } = {}) {
  return User.findOne({ where: { username }, transaction });
}

async function findOrCreateByUsername(username, { transaction } = {}) {
  const [user] = await User.findOrCreate({
    where: { username },
    defaults: { username },
    transaction,
  });
  return user;
}

module.exports = {
  findByUsername,
  findOrCreateByUsername,
};
