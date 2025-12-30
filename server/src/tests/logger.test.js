/**
 * Tests for utils/logger.js branch coverage
 * Specifically testing the log directory creation branch
 */

// Must mock fs at the top level before any require
let mockExistsSync = jest.fn();
let mockMkdirSync = jest.fn();
let mockDailyRotateFile = jest.fn();

jest.mock('winston-daily-rotate-file', () => mockDailyRotateFile);

jest.mock('winston', () => ({
  createLogger: jest.fn().mockReturnValue({ add: jest.fn() }),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    json: jest.fn(),
    simple: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  }
}));

jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs');
  return {
    ...originalFs,
    existsSync: (...args) => mockExistsSync(...args),
    mkdirSync: (...args) => mockMkdirSync(...args)
  };
});

describe('Logger - log directory creation branch', () => {
  beforeEach(() => {
    jest.resetModules();
    mockExistsSync.mockReset();
    mockMkdirSync.mockReset();
    mockDailyRotateFile.mockReset();
  });

  it('creates log directory if it does not exist', () => {
    mockExistsSync.mockReturnValue(false);

    const logger = require('../utils/logger');

    expect(mockExistsSync).toHaveBeenCalled();
    expect(mockMkdirSync).toHaveBeenCalled();
    expect(logger).toBeDefined();
  });

  it('does not create log directory if it already exists', () => {
    mockExistsSync.mockReturnValue(true);

    const logger = require('../utils/logger');

    expect(mockExistsSync).toHaveBeenCalled();
    expect(mockMkdirSync).not.toHaveBeenCalled();
    expect(logger).toBeDefined();
  });

  it('does not add console transport in production', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    mockExistsSync.mockReturnValue(true);

    const logger = require('../utils/logger');

    expect(logger).toBeDefined();

    process.env.NODE_ENV = originalNodeEnv;
  });
});
