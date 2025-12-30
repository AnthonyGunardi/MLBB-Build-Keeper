const express = require('express');
const router = express.Router();
const BuildController = require('../controllers/build');
const { auth } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { uploadLimiter } = require('../middlewares/limiters');

// @route   GET api/heroes/:heroId/builds
// @desc    Get builds for a hero
router.get('/heroes/:heroId/builds', BuildController.getBuilds);

// @route   PUT api/heroes/:heroId/builds/reorder
// @desc    Reorder builds
router.put('/heroes/:heroId/builds/reorder', auth, BuildController.reorderBuilds);

// @route   POST api/heroes/:heroId/builds
// @desc    Upload a build
router.post('/heroes/:heroId/builds', auth, uploadLimiter, upload.single('build_image'), BuildController.createBuild);

// @route   DELETE api/builds/:id
// @desc    Delete a build
router.delete('/builds/:id', auth, BuildController.deleteBuild);

module.exports = router;
