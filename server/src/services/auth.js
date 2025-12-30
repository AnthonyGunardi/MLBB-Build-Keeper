const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthService {
  async register({ email, password }) {
    let user = await User.findOne({ where: { email } });
    if (user) {
      throw new Error('User already exists');
    }

    user = await User.create({
      email,
      password_hash: password,
      role: 'user'
    });

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d' // Longer expiration for convenience in this app
    });

    return token;
  }

  async login({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid Credentials');
    }

    const isMatch = await user.validPassword(password);
    if (!isMatch) {
      throw new Error('Invalid Credentials');
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    return token;
  }
}

module.exports = new AuthService();
