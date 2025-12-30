'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if admin exists to avoid duplicates if re-run
    // Seeder usually meant to be idempotent or one-off
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);

    await queryInterface.bulkInsert(
      'users',
      [
        {
          email: 'admin@mlbuild.com',
          password_hash: hash,
          role: 'admin',
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      { ignoreDuplicates: true }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', { email: 'admin@mlbuild.com' }, {});
  }
};
