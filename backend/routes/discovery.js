const express = require('express');
const router = express.Router();
const discoveryController = require('../controllers/discoveryController');
const { authenticateToken } = require('../middleware/auth');

// Discovery routes (enhanced for frontend)
router.get('/users', authenticateToken, discoveryController.getDiscoveryUsers);
router.get('/categories', discoveryController.getPopularCategories);

// Search and discovery routes (existing)
router.get('/search', discoveryController.searchUsers);
router.get('/suggestions', discoveryController.getSkillSuggestions);
router.get('/featured', discoveryController.getFeaturedUsers);
router.get('/skills-by-category', discoveryController.getSkillsByCategory);

// User profile viewing (public)
router.get('/profile/:userId', discoveryController.getUserProfile);

module.exports = router;
