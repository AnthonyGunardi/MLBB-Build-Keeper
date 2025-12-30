const router = require('express').Router();
const authRoutes = require('./auth');
const heroRoutes = require('./hero');
const buildRoutes = require('./build');
const chatRoutes = require('./chat');

router.use('/api/auth', authRoutes);
router.use('/api', buildRoutes);
router.use('/api/heroes', heroRoutes);
router.use('/api/chat', chatRoutes);

module.exports = router;
