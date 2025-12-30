'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('hero_builds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      hero_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'heroes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      image_path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Enforce uniqueness of display_order per (user, hero)
    await queryInterface.addConstraint('hero_builds', {
      fields: ['user_id', 'hero_id', 'display_order'],
      type: 'unique',
      name: 'unique_build_order_per_hero'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('hero_builds');
  }
};
