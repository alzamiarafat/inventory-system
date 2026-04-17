'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reservations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      dropId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Drops', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING
      },
      expiresAt: {
        allowNull: false,
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

    await queryInterface.addIndex('Reservations', ['dropId', 'status'], {
      name: 'reservations_drop_status_idx'
    });
    await queryInterface.addIndex('Reservations', ['expiresAt'], {
      name: 'reservations_expires_at_idx'
    });

    // At most one ACTIVE reservation per (user, drop).
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX reservations_one_active_per_user_drop
      ON "Reservations" ("userId", "dropId")
      WHERE "status" = 'ACTIVE';
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Reservations');
  }
};