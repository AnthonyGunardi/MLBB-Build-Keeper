const request = require('supertest');
const app = require('../app');

describe('Security Configuration', () => {
  it('should include Helmet security headers', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-dns-prefetch-control']).toBe('off');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('should have rate limiting response headers on auth routes', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.headers).toHaveProperty('ratelimit-limit');
  });
});

describe('CORS Configuration', () => {
  it('should use wildcard when CORS_ORIGIN is not set', async () => {
    const originalEnv = process.env.CORS_ORIGIN;
    delete process.env.CORS_ORIGIN;

    // Mock dotenv to prevent it from reloading .env
    jest.doMock('dotenv', () => ({
      config: jest.fn()
    }));

    let freshApp;
    jest.isolateModules(() => {
      freshApp = require('../app');
    });

    const res = await request(freshApp).get('/health');
    expect(res.headers['access-control-allow-origin']).toBe('*');

    // Restore
    if (originalEnv !== undefined) {
      process.env.CORS_ORIGIN = originalEnv;
    }
    jest.dontMock('dotenv');
  });
});
