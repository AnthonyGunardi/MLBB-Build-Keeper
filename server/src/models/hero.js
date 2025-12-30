module.exports = (sequelize, DataTypes) => {
  const Hero = sequelize.define(
    'Hero',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false
      },
      hero_image_path: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role_icon_path: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      tableName: 'heroes',
      underscored: true
    }
  );

  Hero.associate = function (models) {};

  return Hero;
};
