const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth');
const { authLimiter } = require('../middlewares/limiters');
const { auth } = require('../middlewares/auth');

// @route   POST api/auth/register
// @desc    Register user & get token
// @access  Public
router.post('/register', authLimiter, AuthController.register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authLimiter, AuthController.login);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, AuthController.getMe);

module.exports = router;
