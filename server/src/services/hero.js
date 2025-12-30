const { Hero, Sequelize } = require('../models');
const { Op } = Sequelize;
const fs = require('fs');
const path = require('path');

const deleteFile = relativePath => {
  if (!relativePath) return;
  const fullPath = path.join(__dirname, '../../', relativePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

class HeroService {
  async createHero(data) {
    const existingHero = await Hero.findOne({ where: { name: data.name } });
    if (existingHero) {
      throw new Error(`Hero '${data.name}' already exists`);
    }
    return await Hero.create(data);
  }

  async getAllHeroes(search) {
    if (!search) {
      return await Hero.findAll();
    }
    return await Hero.findAll({
      where: {
        name: {
          [Op.like]: `%${search}%`
        }
      }
    });
  }

  async getHeroById(id) {
    return await Hero.findByPk(id);
  }

  async deleteHero(id) {
    const hero = await Hero.findByPk(id);
    if (!hero) {
      throw new Error('Hero not found');
    }

    deleteFile(hero.hero_image_path);
    deleteFile(hero.role_icon_path);

    await hero.destroy();
    return true;
  }

  async updateHero(id, data) {
    const hero = await Hero.findByPk(id);
    if (!hero) {
      throw new Error('Hero not found');
    }

    if (data.hero_image_path && hero.hero_image_path !== data.hero_image_path) {
      deleteFile(hero.hero_image_path);
    }
    if (data.role_icon_path && hero.role_icon_path !== data.role_icon_path) {
      deleteFile(hero.role_icon_path);
    }

    return await hero.update(data);
  }
}

module.exports = new HeroService();
