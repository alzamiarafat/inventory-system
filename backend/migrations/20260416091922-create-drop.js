'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Drops', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      price: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2)
      },
      totalStock: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      availableStock: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      startsAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      endsAt: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('Drops', ['startsAt'], { name: 'drops_starts_at_idx' });
    await queryInterface.addIndex('Drops', ['endsAt'], { name: 'drops_ends_at_idx' });

    // Guard rails: never negative stock; available <= total.
    await queryInterface.sequelize.query(`
      ALTER TABLE "Drops"
      ADD CONSTRAINT drops_total_stock_nonnegative CHECK ("totalStock" >= 0),
      ADD CONSTRAINT drops_available_stock_nonnegative CHECK ("availableStock" >= 0),
      ADD CONSTRAINT drops_available_lte_total CHECK ("availableStock" <= "totalStock");
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Drops');
  }
};
