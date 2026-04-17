'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Purchase extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Purchase.belongsTo(models.User, { foreignKey: 'userId' });
      Purchase.belongsTo(models.Drop, { foreignKey: 'dropId' });
      Purchase.belongsTo(models.Reservation, { foreignKey: 'reservationId' });
    }
  }
  Purchase.init({
    userId: { type: DataTypes.INTEGER, allowNull: false },
    dropId: { type: DataTypes.INTEGER, allowNull: false },
    reservationId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  }, {
    sequelize,
    modelName: 'Purchase',
  });
  return Purchase;
};
