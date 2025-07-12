const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Personal analytics
router.get('/dashboard', analyticsController.getPersonalDashboard);
router.get('/performance', analyticsController.getPerformanceMetrics);
router.get('/learning-path', analyticsController.getLearningPath);

// Platform analytics
router.get('/skills', analyticsController.getSkillAnalytics);

module.exports = router;
