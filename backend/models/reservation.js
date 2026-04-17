'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reservation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Reservation.belongsTo(models.User, { foreignKey: 'userId' });
      Reservation.belongsTo(models.Drop, { foreignKey: 'dropId' });
      Reservation.hasOne(models.Purchase, { foreignKey: 'reservationId' });
    }
  }
  Reservation.init({
    userId: { type: DataTypes.INTEGER, allowNull: false },
    dropId: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
  }, {
    sequelize,
    modelName: 'Reservation',
  });
  return Reservation;
};