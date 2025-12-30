const mockAxios = jest.fn(() =>
  Promise.resolve({
    data: {
      pipe: () => { },
      on: (e, cb) => {
        if (e === 'end') cb();
      }
    }
  })
);
mockAxios.get = jest.fn();
jest.mock('axios', () => mockAxios);

const mockHero = {
  upsert: jest.fn()
};
jest.mock('../models', () => ({
  Hero: mockHero
}));

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

jest.mock('fs');
const fs = require('fs');

const HeroSeederService = require('../services/heroSeeder');
const { Hero } = require('../models');

describe('HeroSeederService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    HeroSeederService.status = { state: 'idle', message: '', current: 0, total: 0 };

    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fetch heroes and upsert them', async () => {
    mockAxios.get.mockImplementation(url => {
      if (url.includes('/hero-list')) {
        return Promise.resolve({
          data: {
            data: {
              records: [
                {
                  data: {
                    hero_id: 1,
                    hero: { data: { name: 'Layla' } }
                  }
                }
              ]
            }
          }
        });
      }
      if (url.includes('/hero-detail')) {
        return Promise.resolve({
          data: {
            data: {
              records: [
                {
                  data: {
                    hero: {
                      data: {
                        sortlabel: ['Marksman'],
                        sorticon1: 'http://icon',
                        painting: 'http://image',
                        name: 'Layla'
                      }
                    }
                  }
                }
              ]
            }
          }
        });
      }

      return Promise.resolve({
        data: {
          pipe: () => { },
          on: (e, cb) => {
            if (e === 'end') cb();
          }
        }
      });
    });

    const mockStream = {
      on: jest.fn((event, cb) => {
        if (event === 'finish') cb();
        return mockStream;
      }),
      pipe: jest.fn()
    };
    fs.createWriteStream = jest.fn().mockReturnValue(mockStream);
    fs.existsSync.mockReturnValue(false);

    await HeroSeederService.seedHeroes();

    expect(Hero.upsert).toHaveBeenCalled();
    expect(HeroSeederService.getStatus().state).toBe('completed');
  });

  it('should update status to running', async () => {
    mockAxios.get.mockResolvedValue({
      data: { data: { records: [] } }
    });

    const promise = HeroSeederService.seedHeroes();

    expect(HeroSeederService.getStatus().state).toBe('running');
    await promise;
    expect(HeroSeederService.getStatus().state).toBe('completed');
  });

  it('should handle API errors gracefully', async () => {
    mockAxios.get.mockRejectedValue(new Error('API Error'));
    try {
      await HeroSeederService.seedHeroes();
    } catch (e) { }
    const status = HeroSeederService.getStatus();
    expect(status.state).toBe('error');
    expect(status.message).toContain('API Error');
  });

  it('should throw error if seeding already in progress', async () => {
    HeroSeederService.status = { state: 'running', current: 0, total: 0, message: '' };

    await expect(HeroSeederService.seedHeroes()).rejects.toThrow('Seeding already in progress');
  });

  it('should return early if heroesList is null', async () => {
    mockAxios.get.mockResolvedValue({
      data: { data: { records: null } }
    });

    const result = await HeroSeederService.seedHeroes();

    expect(result.count).toBe(0);
    expect(result.msg).toContain('No heroes found');
  });

  it('should skip hero if no detail records found', async () => {
    mockAxios.get.mockImplementation(url => {
      if (url.includes('/hero-list')) {
        return Promise.resolve({
          data: {
            data: {
              records: [
                {
                  data: {
                    hero_id: 1,
                    hero: { data: { name: 'TestHero' } }
                  }
                }
              ]
            }
          }
        });
      }
      if (url.includes('/hero-detail')) {
        return Promise.resolve({
          data: { data: { records: [] } }
        });
      }
      return Promise.resolve({ data: {} });
    });

    await HeroSeederService.seedHeroes();

    expect(Hero.upsert).not.toHaveBeenCalled();
  });

  it('should skip hero if image download fails', async () => {
    mockAxios.get.mockImplementation(url => {
      if (url.includes('/hero-list')) {
        return Promise.resolve({
          data: {
            data: {
              records: [
                {
                  data: {
                    hero_id: 1,
                    hero: { data: { name: 'TestHero' } }
                  }
                }
              ]
            }
          }
        });
      }
      if (url.includes('/hero-detail')) {
        return Promise.resolve({
          data: {
            data: {
              records: [
                {
                  data: {
                    hero: {
                      data: {
                        sortlabel: ['Mage'],
                        sorticon1: 'http://icon',
                        painting: null,
                        head: null
                      }
                    }
                  }
                }
              ]
            }
          }
        });
      }
      return Promise.reject(new Error('Download failed'));
    });

    fs.existsSync.mockReturnValue(false);

    await HeroSeederService.seedHeroes();

    expect(Hero.upsert).not.toHaveBeenCalled();
  });

  it('should return existing path if file already exists', async () => {
    fs.existsSync.mockReturnValue(true);

    const result = await HeroSeederService.downloadImage('http://test.com/image.png', 'test');

    expect(result).toBe('uploads/heroes/test.png');
    expect(fs.createWriteStream).not.toHaveBeenCalled();
  });

  it('should return null if url is empty', async () => {
    const result = await HeroSeederService.downloadImage(null, 'test');

    expect(result).toBeNull();
  });
});
