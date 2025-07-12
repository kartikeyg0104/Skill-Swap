const express = require('express');
const router = express.Router();
const discoveryController = require('../controllers/discoveryController');
const { authenticateToken } = require('../middleware/auth');

// Search and discovery routes
router.get('/search', discoveryController.searchUsers);
router.get('/suggestions', discoveryController.getSkillSuggestions);
router.get('/featured', discoveryController.getFeaturedUsers);
router.get('/categories', discoveryController.getSkillsByCategory);

// User profile viewing (public)
router.get('/profile/:userId', discoveryController.getUserProfile);

module.exports = router;
