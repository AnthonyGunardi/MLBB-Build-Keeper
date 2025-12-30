const BuildController = require('../controllers/build');
const BuildService = require('../services/build');

jest.mock('../services/build');

describe('BuildController', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, user: { id: 1 } };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getBuilds', () => {
    it('should return builds', async () => {
      req.params.heroId = 1;
      BuildService.getBuilds.mockResolvedValue([]);
      await BuildController.getBuilds(req, res, next);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should call next with error on failure', async () => {
      req.params.heroId = 1;
      const error = new Error('Database error');
      BuildService.getBuilds.mockRejectedValue(error);
      await BuildController.getBuilds(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createBuild', () => {
    it('should return 400 if file missing', async () => {
      await BuildController.createBuild(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Build image is required' }));
    });

    it('should create build successfully', async () => {
      req.params.heroId = 1;
      req.body.title = 'Title';
      req.file = { path: 'path' };
      BuildService.createBuild.mockResolvedValue({ id: 1 });

      await BuildController.createBuild(req, res, next);

      expect(BuildService.createBuild).toHaveBeenCalledWith(1, 1, req.file, 'Title');
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle specific service errors', async () => {
      req.file = { path: 'path' };
      BuildService.createBuild.mockRejectedValue(new Error('Maximum 3 builds allowed per hero'));
      await BuildController.createBuild(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);

      BuildService.createBuild.mockRejectedValue(new Error('Hero not found'));
      await BuildController.createBuild(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should call next with error for other failures', async () => {
      req.file = { path: 'path' };
      const error = new Error('Unexpected database error');
      BuildService.createBuild.mockRejectedValue(error);
      await BuildController.createBuild(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteBuild', () => {
    it('should delete build', async () => {
      req.params.id = 1;
      await BuildController.deleteBuild(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Build deleted' });
    });

    it('should handle build not found', async () => {
      BuildService.deleteBuild.mockRejectedValue(new Error('Build not found'));
      await BuildController.deleteBuild(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should call next with error for other failures', async () => {
      const error = new Error('Database connection lost');
      BuildService.deleteBuild.mockRejectedValue(error);
      await BuildController.deleteBuild(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('reorderBuilds', () => {
    it('should reorder builds', async () => {
      req.params.heroId = 1;
      req.body.buildIds = [1, 2];
      await BuildController.reorderBuilds(req, res, next);
      expect(BuildService.reorderBuilds).toHaveBeenCalledWith(1, [1, 2]);
      expect(res.json).toHaveBeenCalled();
    });

    it('should call next with error on failure', async () => {
      req.params.heroId = 1;
      req.body.buildIds = [1, 2];
      const error = new Error('Reorder failed');
      BuildService.reorderBuilds.mockRejectedValue(error);
      await BuildController.reorderBuilds(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
