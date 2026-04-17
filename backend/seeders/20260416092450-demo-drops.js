'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();
    const started = new Date(now.getTime() - 60 * 60 * 1000);

    await queryInterface.bulkInsert(
      'Users',
      [
        { username: 'alice', createdAt: now, updatedAt: now },
        { username: 'bob', createdAt: now, updatedAt: now },
        { username: 'charlie', createdAt: now, updatedAt: now },
        { username: 'dina', createdAt: now, updatedAt: now },
      ],
      {}
    );

    await queryInterface.bulkInsert(
      'Drops',
      [
        {
          name: 'Air Jordan 1',
          price: 220,
          totalStock: 100,
          availableStock: 100,
          startsAt: started,
          endsAt: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Yeezy 350',
          price: 240,
          totalStock: 25,
          availableStock: 25,
          startsAt: started,
          endsAt: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Purchases', null, {});
    await queryInterface.bulkDelete('Reservations', null, {});
    await queryInterface.bulkDelete('Drops', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
