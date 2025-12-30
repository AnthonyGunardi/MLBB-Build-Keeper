const AuthController = require('../controllers/auth');
const AuthService = require('../services/auth');

jest.mock('../services/auth');

describe('AuthController', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      req.body = { email: 'test@test.com', password: 'pass' };
      AuthService.register.mockResolvedValue('mock-token');

      await AuthController.register(req, res, next);

      expect(AuthService.register).toHaveBeenCalledWith({ email: 'test@test.com', password: 'pass' });
      expect(res.json).toHaveBeenCalledWith({ token: 'mock-token' });
    });

    it('should return 400 if email/pass missing', async () => {
      req.body = {};
      await AuthController.register(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Please provide email and password' });
    });

    it('should return 400 if user already exists', async () => {
      req.body = { email: 'exists@test.com', password: 'pass' };
      const error = new Error('User already exists');
      AuthService.register.mockRejectedValue(error);

      await AuthController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'User already exists' });
    });

    it('should call next with error for other failures', async () => {
      req.body = { email: 'test@test.com', password: 'pass' };
      const error = new Error('Database error');
      AuthService.register.mockRejectedValue(error);

      await AuthController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      req.body = { email: 'test@test.com', password: 'pass' };
      AuthService.login.mockResolvedValue('mock-token');

      await AuthController.login(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ token: 'mock-token' });
    });

    it('should return 400 if email/pass missing', async () => {
      req.body = {};
      await AuthController.login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 for Invalid Credentials', async () => {
      req.body = { email: 'test@test.com', password: 'pass' };
      const error = new Error('Invalid Credentials');
      AuthService.login.mockRejectedValue(error);

      await AuthController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid Credentials' });
    });

    it('should call next with error for other login failures', async () => {
      req.body = { email: 'test@test.com', password: 'pass' };
      const error = new Error('Database connection error');
      AuthService.login.mockRejectedValue(error);

      await AuthController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getMe', () => {
    it('should return req.user', async () => {
      req.user = { id: 1, email: 'test@test.com' };
      await AuthController.getMe(req, res, next);
      expect(res.json).toHaveBeenCalledWith(req.user);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Unexpected error');
      res.json = jest.fn().mockImplementation(() => {
        throw error;
      });
      req.user = { id: 1 };

      await AuthController.getMe(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
