const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat');
const { auth } = require('../middlewares/auth');

router.post('/', auth, chatController.chat);

module.exports = router;
