module.exports = (sequelize, DataTypes) => {
  const HeroBuild = sequelize.define(
    'HeroBuild',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      hero_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      image_path: {
        type: DataTypes.STRING,
        allowNull: false
      },
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      tableName: 'hero_builds',
      underscored: true
    }
  );

  HeroBuild.associate = function (models) {
    HeroBuild.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    HeroBuild.belongsTo(models.Hero, { foreignKey: 'heroId', as: 'hero' });
  };

  return HeroBuild;
};
