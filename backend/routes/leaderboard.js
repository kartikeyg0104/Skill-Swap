const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { authenticateToken } = require('../middleware/auth');

// Public leaderboards
router.get('/', leaderboardController.getGlobalLeaderboard);
router.get('/skills', leaderboardController.getSkillLeaderboard);
router.get('/community-stats', leaderboardController.getCommunityStats);

// Authenticated routes
router.get('/my-rank', authenticateToken, leaderboardController.getUserRank);

module.exports = router;
