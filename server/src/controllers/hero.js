const HeroService = require('../services/hero');
const logger = require('../utils/logger');

class HeroController {
  async createHero(req, res, next) {
    try {
      const { name, role } = req.body;
      const files = req.files;

      if (!files || !files.hero_image || !files.role_icon) {
        return res.status(400).json({ msg: 'Both hero image and role icon are required' });
      }

      const heroData = {
        name,
        role,
        hero_image_path: files.hero_image[0].path.replace(/\\/g, '/').split('server/')[1] || files.hero_image[0].path,
        role_icon_path: files.role_icon[0].path.replace(/\\/g, '/').split('server/')[1] || files.role_icon[0].path
      };

      // Normalize Windows paths to POSIX for consistency across OS and frontend usage

      const normalizePath = p => {
        // find index of 'uploads'
        const idx = p.indexOf('uploads');
        if (idx !== -1) return p.substring(idx).replace(/\\/g, '/');
        return p.replace(/\\/g, '/');
      };

      heroData.hero_image_path = normalizePath(files.hero_image[0].path);
      heroData.role_icon_path = normalizePath(files.role_icon[0].path);

      const hero = await HeroService.createHero(heroData);
      res.json(hero);
    } catch (err) {
      if (err.message.includes('already exists')) {
        return res.status(400).json({ msg: err.message });
      }
      next(err);
    }
  }

  async getHeroes(req, res, next) {
    try {
      const { search } = req.query;
      const heroes = await HeroService.getAllHeroes(search);
      res.json(heroes);
    } catch (err) {
      next(err);
    }
  }

  async deleteHero(req, res, next) {
    try {
      const { id } = req.params;
      await HeroService.deleteHero(id);
      res.json({ msg: 'Hero deleted' });
    } catch (err) {
      if (err.message === 'Hero not found') {
        return res.status(404).json({ msg: err.message });
      }
      next(err);
    }
  }

  async updateHero(req, res, next) {
    try {
      const { id } = req.params;
      const { name, role } = req.body;
      /* istanbul ignore next -- @preserve Fallback never hit: multer middleware always provides req.files object */
      const files = req.files || {};

      const updateData = {};
      if (name) updateData.name = name;
      if (role) updateData.role = role;

      const normalizePath = p => {
        const idx = p.indexOf('uploads');
        if (idx !== -1) return p.substring(idx).replace(/\\/g, '/');
        return p.replace(/\\/g, '/');
      };

      if (files.hero_image) {
        updateData.hero_image_path = normalizePath(files.hero_image[0].path);
      }
      if (files.role_icon) {
        updateData.role_icon_path = normalizePath(files.role_icon[0].path);
      }

      const hero = await HeroService.updateHero(id, updateData);
      res.json(hero);
    } catch (err) {
      next(err);
    }
  }

  async seedHeroes(req, res, next) {
    try {
      const HeroSeederService = require('../services/heroSeeder');

      HeroSeederService.seedHeroes()
        .then(result => {
          logger.info(`Seeding finished: ${result.count} heroes processed.`);
        })
        .catch(err => {
          logger.error('Seeding error:', err);
        });

      res.json({ msg: 'Seeding started in background. Check logs or refresh hero list in a minute.' });
    } catch (err) {
      next(err);
    }
  }

  getSeedStatus(req, res) {
    const HeroSeederService = require('../services/heroSeeder');
    res.json(HeroSeederService.getStatus());
  }
}

module.exports = new HeroController();
