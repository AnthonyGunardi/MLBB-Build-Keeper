const { Hero, HeroBuild, User } = require('../models');
const HeroService = require('../services/hero');
const BuildService = require('../services/build');
const AuthService = require('../services/auth');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

jest.mock('../models');
jest.mock('sharp');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Backend Services', () => {
  describe('HeroService', () => {
    beforeEach(() => {
      // Mock fs methods with spies instead of global mock
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => { });
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('createHero throws if hero exists', async () => {
      Hero.findOne.mockResolvedValue({ id: 1 });
      await expect(HeroService.createHero({ name: 'Layla' })).rejects.toThrow('already exists');
    });

    it('deleteHero throws if not found', async () => {
      Hero.findByPk.mockResolvedValue(null);
      await expect(HeroService.deleteHero(1)).rejects.toThrow('Hero not found');
    });

    it('deleteHero removes files if they exist', async () => {
      Hero.findByPk.mockResolvedValue({
        hero_image_path: 'uploads/img.jpg',
        role_icon_path: 'uploads/icon.jpg',
        destroy: jest.fn()
      });
      fs.existsSync.mockReturnValue(true);

      await HeroService.deleteHero(1);

      expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
    });

    it('updateHero throws if not found', async () => {
      Hero.findByPk.mockResolvedValue(null);
      await expect(HeroService.updateHero(1, {})).rejects.toThrow('Hero not found');
    });

    it('updateHero removes old files if changed', async () => {
      Hero.findByPk.mockResolvedValue({
        hero_image_path: 'old/img.jpg',
        update: jest.fn()
      });
      fs.existsSync.mockReturnValue(true);

      await HeroService.updateHero(1, { hero_image_path: 'new/img.jpg' });

      expect(fs.unlinkSync).toHaveBeenCalled();
    });
    it('getAllHeroes returns all heroes', async () => {
      Hero.findAll.mockResolvedValue([]);
      const res = await HeroService.getAllHeroes();
      expect(res).toEqual([]);
    });

    it('getHeroById returns hero', async () => {
      Hero.findByPk.mockResolvedValue({ id: 1 });
      const res = await HeroService.getHeroById(1);
      expect(res).toEqual({ id: 1 });
    });
  });

  describe('BuildService', () => {
    beforeEach(() => {
      // Mock fs methods with spies instead of global mock
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => { });
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('createBuild throws if hero not found', async () => {
      Hero.findByPk.mockResolvedValue(null);
      await expect(BuildService.createBuild(1, 1, {}, 'Title')).rejects.toThrow('Hero not found');
    });

    it('createBuild throws if max builds reached', async () => {
      Hero.findByPk.mockResolvedValue({ id: 1 });
      HeroBuild.count.mockResolvedValue(3);
      await expect(BuildService.createBuild(1, 1, {}, 'Title')).rejects.toThrow('Maximum 3 builds');
    });

    it('createBuild processes image and removes temp', async () => {
      Hero.findByPk.mockResolvedValue({ id: 1 });
      HeroBuild.count.mockResolvedValue(0);
      HeroBuild.findOne.mockResolvedValue(null); // No previous builds
      HeroBuild.create.mockResolvedValue({ id: 1 });

      fs.existsSync.mockReturnValue(true);

      // Mock sharp chain
      const sharpMock = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue()
      };
      sharp.mockReturnValue(sharpMock);

      await BuildService.createBuild(1, 1, { path: 'temp/file' }, 'Title');

      expect(sharp).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalledWith('temp/file');
    });

    it('deleteBuild throws if not found', async () => {
      HeroBuild.findOne.mockResolvedValue(null);
      await expect(BuildService.deleteBuild(1, 1)).rejects.toThrow('Build not found');
    });

    it('deleteBuild handles file delete error gracefully', async () => {
      HeroBuild.findOne.mockResolvedValue({
        image_path: 'uploads/build.jpg',
        destroy: jest.fn()
      });
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockImplementation(() => {
        throw new Error('Delete failed');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      await BuildService.deleteBuild(1, 1);

      expect(consoleSpy).toHaveBeenCalledWith('File delete failed:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('getBuilds returns builds', async () => {
      HeroBuild.findAll.mockResolvedValue([]);
      const res = await BuildService.getBuilds(1);
      expect(res).toEqual([]);
    });

    it('reorderBuilds updates order', async () => {
      HeroBuild.update.mockResolvedValue([1]);
      const res = await BuildService.reorderBuilds(1, [10, 20]);
      expect(HeroBuild.update).toHaveBeenCalledTimes(2);
      expect(res).toBe(true);
    });
  });
});

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('register throws if user exists', async () => {
    User.findOne.mockResolvedValue({ id: 1 });
    await expect(AuthService.register({ email: 'test@test.com' })).rejects.toThrow('User already exists');
  });

  it('login throws if user not found', async () => {
    User.findOne.mockResolvedValue(null);
    await expect(AuthService.login({ email: 'test@test.com' })).rejects.toThrow('Invalid Credentials');
  });

  it('login throws if password invalid', async () => {
    const user = {
      validPassword: jest.fn().mockResolvedValue(false)
    };
    User.findOne.mockResolvedValue(user);
    await expect(AuthService.login({ email: 'test@test.com' })).rejects.toThrow('Invalid Credentials');
  });
});
