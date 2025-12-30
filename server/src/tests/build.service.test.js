const mockHeroBuild = {
  count: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};
const mockHero = {
  findByPk: jest.fn()
};

jest.mock('../models', () => ({
  HeroBuild: mockHeroBuild,
  Hero: mockHero
}));

jest.mock('sharp');
jest.mock('fs');

const BuildService = require('../services/build');
const { HeroBuild, Hero } = require('../models');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

describe('BuildService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBuild', () => {
    it('should throw error if max builds reached', async () => {
      Hero.findByPk.mockResolvedValue({ id: 1 });
      HeroBuild.count.mockResolvedValue(3);
      await expect(BuildService.createBuild(1, 1, { path: 'temp.jpg' }, 'Title')).rejects.toThrow(
        'Maximum 3 builds allowed per hero'
      );
    });

    it('should proceed if builds < 3', async () => {
      Hero.findByPk.mockResolvedValue({ id: 1 });
      HeroBuild.count.mockResolvedValue(2);
      HeroBuild.findOne.mockResolvedValue({ display_order: 2 });
      HeroBuild.create.mockResolvedValue({ id: 1, title: 'New Build' });

      const mockSharp = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue(true)
      };
      sharp.mockReturnValue(mockSharp);
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockReturnValue(true);

      await BuildService.createBuild(1, 1, { path: 'temp.jpg' }, 'New Build');

      expect(sharp).toHaveBeenCalled();
      expect(mockSharp.resize).toHaveBeenCalled();
      expect(HeroBuild.create).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    it('should not try to delete temp file if it does not exist', async () => {
      Hero.findByPk.mockResolvedValue({ id: 1 });
      HeroBuild.count.mockResolvedValue(2);
      HeroBuild.findOne.mockResolvedValue({ display_order: 2 });
      HeroBuild.create.mockResolvedValue({ id: 1, title: 'New Build' });

      const mockSharp = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue(true)
      };
      sharp.mockReturnValue(mockSharp);
      fs.existsSync.mockReturnValue(false); // File doesn't exist

      await BuildService.createBuild(1, 1, { path: 'temp.jpg' }, 'New Build');

      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('deleteBuild', () => {
    it('should delete file and record', async () => {
      const mockBuildInstance = {
        id: 1,
        image_path: 'uploads/builds/1.jpg',
        destroy: jest.fn().mockResolvedValue(true)
      };
      HeroBuild.findOne.mockResolvedValue(mockBuildInstance);
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockReturnValue(true);

      await BuildService.deleteBuild(1, 1);

      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(mockBuildInstance.destroy).toHaveBeenCalled(); // Check instance method
    });

    it('should throw if build not found', async () => {
      HeroBuild.findOne.mockResolvedValue(null);
      await expect(BuildService.deleteBuild(1, 999)).rejects.toThrow('Build not found');
    });

    it('should not try to delete file if it does not exist', async () => {
      const mockBuildInstance = {
        id: 1,
        image_path: 'uploads/builds/1.jpg',
        destroy: jest.fn().mockResolvedValue(true)
      };
      HeroBuild.findOne.mockResolvedValue(mockBuildInstance);
      fs.existsSync.mockReturnValue(false); // File doesn't exist

      await BuildService.deleteBuild(1, 1);

      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(mockBuildInstance.destroy).toHaveBeenCalled();
    });
  });

  describe('reorderBuilds', () => {
    it('should update display orders', async () => {
      HeroBuild.update.mockResolvedValue([1]);
      await BuildService.reorderBuilds(1, [3, 1, 2]);
      expect(HeroBuild.update).toHaveBeenCalledTimes(3);
      expect(HeroBuild.update).toHaveBeenCalledWith({ display_order: 1 }, expect.anything());
    });
  });
});
