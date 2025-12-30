const express = require('express');
const router = express.Router();
const HeroController = require('../controllers/hero');
const { auth, admin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// @route   GET api/heroes
// @desc    Get all heroes
// @access  Public (Req-26) / Or Private? PRD Req-26 says "Guests can view heroes".
router.get('/', HeroController.getHeroes);

// @route   POST api/heroes
// @desc    Create a hero
// @access  Admin only
router.post(
  '/',
  [auth, admin],
  upload.fields([
    { name: 'hero_image', maxCount: 1 },
    { name: 'role_icon', maxCount: 1 }
  ]),
  HeroController.createHero
);

// @route   POST api/heroes/seed
// @desc    Seed heroes from external API
// @access  Admin only
router.post('/seed', [auth, admin], HeroController.seedHeroes);

// @route   GET api/heroes/seed/status
// @desc    Get seeding status
// @access  Admin only
router.get('/seed/status', [auth, admin], HeroController.getSeedStatus);

// @route   PUT api/heroes/:id
// @desc    Update a hero
// @access  Admin only
router.put(
  '/:id',
  [auth, admin],
  upload.fields([
    { name: 'hero_image', maxCount: 1 },
    { name: 'role_icon', maxCount: 1 }
  ]),
  HeroController.updateHero
);

// @route   DELETE api/heroes/:id
// @desc    Delete a hero
// @access  Admin only
router.delete('/:id', [auth, admin], HeroController.deleteHero);

module.exports = router;
