const BuildService = require('../services/build');

class BuildController {
  async getBuilds(req, res, next) {
    try {
      const { heroId } = req.params;
      const builds = await BuildService.getBuilds(heroId);
      res.json(builds);
    } catch (err) {
      next(err);
    }
  }

  async createBuild(req, res, next) {
    try {
      const { heroId } = req.params;
      const { title } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ msg: 'Build image is required' });
      }

      const build = await BuildService.createBuild(req.user.id, heroId, file, title);
      res.json(build);
    } catch (err) {
      if (err.message === 'Maximum 3 builds allowed per hero') {
        return res.status(400).json({ msg: err.message });
      }
      if (err.message === 'Hero not found') {
        return res.status(404).json({ msg: err.message });
      }
      next(err);
    }
  }

  async deleteBuild(req, res, next) {
    try {
      const { id } = req.params;
      await BuildService.deleteBuild(req.user.id, id);
      res.json({ msg: 'Build deleted' });
    } catch (err) {
      if (err.message === 'Build not found') {
        return res.status(404).json({ msg: err.message });
      }
      next(err);
    }
  }

  async reorderBuilds(req, res, next) {
    try {
      const { heroId } = req.params;
      const { buildIds } = req.body;
      await BuildService.reorderBuilds(heroId, buildIds);
      res.json({ msg: 'Builds reordered' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BuildController();
