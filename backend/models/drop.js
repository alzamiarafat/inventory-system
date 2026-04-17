'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Drop extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Drop.hasMany(models.Reservation, { foreignKey: 'dropId' });
      Drop.hasMany(models.Purchase, { foreignKey: 'dropId' });
    }
  }
  Drop.init({
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    totalStock: { type: DataTypes.INTEGER, allowNull: false },
    availableStock: { type: DataTypes.INTEGER, allowNull: false },
    startsAt: { type: DataTypes.DATE, allowNull: false },
    endsAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Drop',
  });
  return Drop;
};
