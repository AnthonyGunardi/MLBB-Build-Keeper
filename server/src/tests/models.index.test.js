/**
 * Tests for models/index.js branch coverage
 * Specifically testing the use_env_variable branch
 */

describe('Models Index - use_env_variable branch', () => {
  let originalEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('uses use_env_variable when config specifies it', () => {
    // Mock the config to include use_env_variable
    jest.doMock('../config/config.js', () => ({
      test: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'mysql',
        logging: false
      }
    }));

    // Set up the environment variable
    process.env.DATABASE_URL = 'mysql://root:password@localhost:3306/test_db';
    process.env.NODE_ENV = 'test';

    // This require will hit the use_env_variable branch
    const db = require('../models');

    expect(db.sequelize).toBeDefined();
    expect(db.Sequelize).toBeDefined();
  });
});
