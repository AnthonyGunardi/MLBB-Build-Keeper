const AuthService = require('../services/auth');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ msg: 'Please provide email and password' });
      }
      const token = await AuthService.register({ email, password });
      res.json({ token });
    } catch (err) {
      if (err.message === 'User already exists') {
        return res.status(400).json({ msg: err.message });
      }
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ msg: 'Please provide email and password' });
      }
      const token = await AuthService.login({ email, password });
      res.json({ token });
    } catch (err) {
      if (err.message === 'Invalid Credentials') {
        return res.status(400).json({ msg: err.message });
      }
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      res.json(req.user);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
