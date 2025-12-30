const AuthService = require('../services/auth');
const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../models');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw error if user already exists', async () => {
      User.findOne.mockResolvedValue({ id: 1, email: 'test@example.com' });
      await expect(AuthService.register({ email: 'test@example.com', password: 'password' })).rejects.toThrow(
        'User already exists'
      );
    });

    it('should create user and return token', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        role: 'user',
        validPassword: jest.fn()
      });
      jwt.sign.mockReturnValue('mock-token');

      const token = await AuthService.register({ email: 'test@example.com', password: 'password' });
      expect(token).toBe('mock-token');
      expect(User.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw error if user not found', async () => {
      User.findOne.mockResolvedValue(null);
      await expect(AuthService.login({ email: 'test@example.com', password: 'password' })).rejects.toThrow(
        'Invalid Credentials'
      );
    });

    it('should throw error if password invalid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        validPassword: jest.fn().mockResolvedValue(false)
      };
      User.findOne.mockResolvedValue(mockUser);

      await expect(AuthService.login({ email: 'test@example.com', password: 'password' })).rejects.toThrow(
        'Invalid Credentials'
      );
    });

    it('should return token on success', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        validPassword: jest.fn().mockResolvedValue(true),
        role: 'user'
      };
      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock-token');

      const token = await AuthService.login({ email: 'test@example.com', password: 'password' });
      expect(token).toBe('mock-token');
    });
  });
});
