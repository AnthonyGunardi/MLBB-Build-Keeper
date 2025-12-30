const HeroController = require('../controllers/hero');
const HeroService = require('../services/hero');
const httpMocks = require('node-mocks-http');

jest.mock('../services/hero');

describe('HeroController.getHeroes', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  it('should return all heroes when no search query is provided', async () => {
    const mockHeroes = [{ name: 'Layla' }, { name: 'Balmond' }];
    HeroService.getAllHeroes.mockResolvedValue(mockHeroes);

    await HeroController.getHeroes(req, res, next);

    expect(HeroService.getAllHeroes).toHaveBeenCalledWith(undefined);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(mockHeroes);
  });

  it('should return filtered heroes when search query is provided', async () => {
    req.query.search = 'Lay';
    const mockHeroes = [{ name: 'Layla' }];
    HeroService.getAllHeroes.mockResolvedValue(mockHeroes);

    await HeroController.getHeroes(req, res, next);

    expect(HeroService.getAllHeroes).toHaveBeenCalledWith('Lay');
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(mockHeroes);
  });

  it('should handle errors', async () => {
    const errorMessage = 'Database error';
    HeroService.getAllHeroes.mockRejectedValue(new Error(errorMessage));

    await HeroController.getHeroes(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe(errorMessage);
  });
});
