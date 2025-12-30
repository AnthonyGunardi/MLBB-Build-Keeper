// Mock dotenv to prevent it from loading .env file
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should use defaults when env variables not set', () => {
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;
    delete process.env.DB_HOST;
    delete process.env.DB_NAME_TEST;

    const config = require('../config/config');

    expect(config.development.username).toBe('root');
    expect(config.development.password).toBe(null);
    expect(config.development.database).toBe('ml_build_keeper');
    expect(config.development.host).toBe('127.0.0.1');
    expect(config.test.username).toBe('root');
    expect(config.test.password).toBe(null);
    expect(config.test.database).toBe('ml_build_keeper_test');
    expect(config.test.host).toBe('127.0.0.1');
  });

  it('should use env variables when set', () => {
    process.env.DB_USER = 'envuser';
    process.env.DB_PASSWORD = 'envpass';
    process.env.DB_NAME = 'envdb';
    process.env.DB_HOST = 'envhost';
    process.env.DB_NAME_TEST = 'envdb_test';

    const config = require('../config/config');

    expect(config.development.username).toBe('envuser');
    expect(config.development.password).toBe('envpass');
    expect(config.development.database).toBe('envdb');
    expect(config.development.host).toBe('envhost');
    expect(config.test.username).toBe('envuser');
    expect(config.test.password).toBe('envpass');
    expect(config.test.database).toBe('envdb_test');
    expect(config.test.host).toBe('envhost');
  });
});
