const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const { authenticateToken } = require('../middleware/auth');
const { validateCreditTransfer } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Achievements
router.get('/achievements', gamificationController.getAchievements);
router.get('/achievements/:userId', gamificationController.getAchievements);

// Credits
router.get('/credits', gamificationController.getCreditBalance);
router.post('/credits/transfer', validateCreditTransfer, gamificationController.transferCredits);

// Progress tracking
router.get('/progress', gamificationController.getProgressStats);

module.exports = router;
