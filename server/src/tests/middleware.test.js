const jwt = require('jsonwebtoken');
const { auth, admin } = require('../middlewares/auth');
const errorHandler = require('../middlewares/errorHandler');
const upload = require('../middlewares/upload');
const logger = require('../utils/logger');
const path = require('path');

jest.mock('../utils/logger');
jest.mock('jsonwebtoken');

describe('Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { header: jest.fn(), headers: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('Auth Middleware', () => {
    it('should call next if token is valid', () => {
      req.header.mockReturnValue('valid-token');
      jwt.verify.mockReturnValue({ user: { id: 1 } });

      auth(req, res, next);

      expect(jwt.verify).toHaveBeenCalled();
      expect(req.user).toEqual({ id: 1 });
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if no token', () => {
      req.header.mockReturnValue(null);
      auth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'No token, authorization denied' }));
    });

    it('should return 401 if token invalid', () => {
      req.header.mockReturnValue('invalid-token');
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid');
      });

      auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Token is not valid' }));
    });
  });

  describe('Admin Middleware', () => {
    it('should call next if user is admin', () => {
      req.user = { role: 'admin' };
      admin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user is not admin', () => {
      req.user = { role: 'user' };
      admin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Access denied: Admins only' }));
    });

    it('should return 403 if no user', () => {
      req.user = null;
      admin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Error Handler Middleware', () => {
    it('should log error and return 500 by default', () => {
      const err = new Error('Test Error');
      errorHandler(err, req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Test Error' }));
    });

    it('should use error status code if present', () => {
      const err = new Error('Test Error');
      err.statusCode = 404;
      errorHandler(err, req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should use fallback message when error has no message', () => {
      const err = {};
      err.message = '';
      errorHandler(err, req, res, next);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Internal Server Error'
        })
      );
    });
  });

  describe('Upload Middleware Configuration', () => {
    it('fileFilter should accept images', () => {
      const file = { originalname: 'test.png', mimetype: 'image/png' };
      const cb = jest.fn();

      upload.fileFilter(req, file, cb);

      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('fileFilter should reject non-images', () => {
      const file = { originalname: 'test.txt', mimetype: 'text/plain' };
      const cb = jest.fn();

      upload.fileFilter(req, file, cb);

      expect(cb).toHaveBeenCalledWith(expect.any(Error));
    });

    it('storage destination should be correct', () => {
      const cb = jest.fn();

      upload.storage.getDestination(req, { fieldname: 'hero_image' }, cb);
      expect(cb).toHaveBeenCalledWith(null, expect.stringContaining('heroes'));

      upload.storage.getDestination(req, { fieldname: 'build_image' }, cb);
      expect(cb).toHaveBeenCalledWith(null, expect.stringContaining('builds'));

      upload.storage.getDestination(req, { fieldname: 'other' }, cb);
      expect(cb).toHaveBeenCalledWith(null, expect.not.stringContaining('heroes'));
    });

    it('storage filename should use uuid', () => {
      const cb = jest.fn();
      const file = { originalname: 'test.png' };

      upload.storage.getFilename(req, file, cb);

      expect(cb).toHaveBeenCalled();
      const filename = cb.mock.calls[0][1];
      expect(filename).toMatch(/.+\.png$/);
    });
  });
});
