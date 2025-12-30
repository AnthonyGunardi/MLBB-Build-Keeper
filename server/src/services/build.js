const { HeroBuild, Hero } = require('../models');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

class BuildService {
  async getBuilds(heroId) {
    return await HeroBuild.findAll({
      where: { hero_id: heroId },
      order: [['display_order', 'ASC']],
      include: ['user']
    });
  }

  async createBuild(userId, heroId, file, title) {
    const hero = await Hero.findByPk(heroId);
    if (!hero) {
      throw new Error('Hero not found');
    }

    const count = await HeroBuild.count({ where: { user_id: userId, hero_id: heroId } });
    if (count >= 3) {
      throw new Error('Maximum 3 builds allowed per hero');
    }

    const filename = `${uuidv4()}.jpg`;
    const outputPath = path.join(__dirname, '../../uploads/builds', filename);
    const relativePath = `uploads/builds/${filename}`;

    await sharp(file.path)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    const maxOrderBuild = await HeroBuild.findOne({
      where: { user_id: userId, hero_id: heroId },
      order: [['display_order', 'DESC']]
    });
    const nextOrder = maxOrderBuild ? maxOrderBuild.display_order + 1 : 1;

    const build = await HeroBuild.create({
      user_id: userId,
      hero_id: heroId,
      title: title,
      image_path: relativePath,
      display_order: nextOrder
    });

    return build;
  }

  async deleteBuild(userId, buildId) {
    const build = await HeroBuild.findOne({ where: { id: buildId, user_id: userId } });
    if (!build) {
      throw new Error('Build not found');
    }

    const absolutePath = path.join(__dirname, '../../', build.image_path);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (e) {
        console.error('File delete failed:', e);
      }
    }

    await build.destroy();
    return true;
  }

  async reorderBuilds(heroId, buildIds) {
    const updates = buildIds.map((id, index) => {
      return HeroBuild.update({ display_order: index + 1 }, { where: { id: id, hero_id: heroId } });
    });
    await Promise.all(updates);
    return true;
  }
}

module.exports = new BuildService();
