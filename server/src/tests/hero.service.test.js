const mockHero = {
  findByPk: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn()
};

jest.mock('../models', () => {
  const Sequelize = require('sequelize');
  return {
    Hero: mockHero,
    Sequelize: {
      Op: Sequelize.Op
    }
  };
});

jest.mock('fs');
const fs = require('fs');
const path = require('path');
const HeroService = require('../services/hero');
const { Hero, Sequelize } = require('../models');

describe('HeroService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllHeroes', () => {
    it('should return all heroes if no query is provided', async () => {
      const mockHeroes = [{ name: 'Layla' }];
      Hero.findAll.mockResolvedValue(mockHeroes);

      const result = await HeroService.getAllHeroes();
      expect(result).toEqual(mockHeroes);
      expect(Hero.findAll).toHaveBeenCalledWith();
    });

    it('should return filtered heroes if query is provided', async () => {
      const mockHeroes = [{ name: 'Layla' }];
      Hero.findAll.mockResolvedValue(mockHeroes);

      const result = await HeroService.getAllHeroes('Lay');
      expect(result).toEqual(mockHeroes);
      expect(Hero.findAll).toHaveBeenCalledWith({
        where: {
          name: {
            [Sequelize.Op.like]: '%Lay%'
          }
        }
      });
    });
  });

  describe('createHero', () => {
    it('should create a hero if name is unique', async () => {
      Hero.findOne.mockResolvedValue(null);
      Hero.create.mockResolvedValue({ id: 1, name: 'Layla' });

      const result = await HeroService.createHero({ name: 'Layla' });
      expect(result).toEqual({ id: 1, name: 'Layla' });
      expect(Hero.create).toHaveBeenCalledWith({ name: 'Layla' });
    });

    it('should throw error if hero already exists', async () => {
      Hero.findOne.mockResolvedValue({ id: 1, name: 'Layla' });
      await expect(HeroService.createHero({ name: 'Layla' })).rejects.toThrow("Hero 'Layla' already exists");
    });
  });

  describe('updateHero', () => {
    it('should update hero and delete old images if new ones provided', async () => {
      const mockInstance = {
        id: 1,
        name: 'Layla',
        hero_image_path: 'old_path.jpg',
        update: jest.fn().mockResolvedValue({ id: 1, name: 'Layla', hero_image_path: 'new_path.jpg' })
      };
      Hero.findByPk.mockResolvedValue(mockInstance);
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockReturnValue(true);

      const updateData = {
        name: 'Layla',
        hero_image_path: 'new_path.jpg'
      };

      const result = await HeroService.updateHero(1, updateData);

      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(mockInstance.update).toHaveBeenCalledWith(updateData);
      expect(result.hero_image_path).toBe('new_path.jpg');
    });

    it('should not delete files if paths are unchanged', async () => {
      const mockInstance = {
        id: 1,
        name: 'Layla',
        hero_image_path: 'path.jpg',
        update: jest.fn().mockResolvedValue(true)
      };
      Hero.findByPk.mockResolvedValue(mockInstance);

      const updateData = { name: 'Layla Updated', hero_image_path: 'path.jpg' };
      await HeroService.updateHero(1, updateData);

      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(mockInstance.update).toHaveBeenCalledWith(updateData);
    });

    it('should throw if hero not found', async () => {
      Hero.findByPk.mockResolvedValue(null);
      await expect(HeroService.updateHero(99, {})).rejects.toThrow('Hero not found');
    });

    it('should update role_icon_path and delete old one if changed', async () => {
      const mockInstance = {
        id: 1,
        name: 'Layla',
        role_icon_path: 'old_icon.jpg',
        update: jest.fn().mockResolvedValue({ id: 1, role_icon_path: 'new_icon.jpg' })
      };
      Hero.findByPk.mockResolvedValue(mockInstance);
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockReturnValue(true);

      const updateData = { role_icon_path: 'new_icon.jpg' };
      await HeroService.updateHero(1, updateData);

      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(mockInstance.update).toHaveBeenCalledWith(updateData);
    });

    it('should handle null relativePath in deleteFile', async () => {
      const mockInstance = {
        id: 1,
        hero_image_path: null,
        role_icon_path: null,
        update: jest.fn().mockResolvedValue(true)
      };
      Hero.findByPk.mockResolvedValue(mockInstance);

      await HeroService.updateHero(1, { hero_image_path: 'new.jpg' });

      // Should not throw and unlink should not be called for null paths
      expect(mockInstance.update).toHaveBeenCalled();
    });

    it('should handle file not existing', async () => {
      const mockInstance = {
        id: 1,
        hero_image_path: 'nonexistent.jpg',
        update: jest.fn().mockResolvedValue(true)
      };
      Hero.findByPk.mockResolvedValue(mockInstance);
      fs.existsSync.mockReturnValue(false);

      await HeroService.updateHero(1, { hero_image_path: 'new.jpg' });

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('deleteHero', () => {
    it('should delete hero and associated images', async () => {
      const mockInstance = {
        id: 1,
        hero_image_path: 'hero.jpg',
        role_icon_path: 'role.jpg',
        destroy: jest.fn().mockResolvedValue(true)
      };
      Hero.findByPk.mockResolvedValue(mockInstance);
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockReturnValue(true);

      await HeroService.deleteHero(1);

      expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
      expect(mockInstance.destroy).toHaveBeenCalled();
    });

    it('should throw if hero not found', async () => {
      Hero.findByPk.mockResolvedValue(null);
      await expect(HeroService.deleteHero(99)).rejects.toThrow('Hero not found');
    });

    it('should handle null image paths', async () => {
      const mockInstance = {
        id: 1,
        hero_image_path: null,
        role_icon_path: null,
        destroy: jest.fn().mockResolvedValue(true)
      };
      Hero.findByPk.mockResolvedValue(mockInstance);

      await HeroService.deleteHero(1);

      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(mockInstance.destroy).toHaveBeenCalled();
    });

    it('should handle files not existing', async () => {
      const mockInstance = {
        id: 1,
        hero_image_path: 'nonexistent.jpg',
        role_icon_path: 'alsononexistent.jpg',
        destroy: jest.fn().mockResolvedValue(true)
      };
      Hero.findByPk.mockResolvedValue(mockInstance);
      fs.existsSync.mockReturnValue(false);

      await HeroService.deleteHero(1);

      expect(fs.existsSync).toHaveBeenCalledTimes(2);
      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(mockInstance.destroy).toHaveBeenCalled();
    });
  });
});
