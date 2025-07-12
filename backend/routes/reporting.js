const express = require('express');
const router = express.Router();
const reportingController = require('../controllers/reportingController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'MODERATOR']));

// Standard reports
router.get('/user-activity', reportingController.getUserActivityReport);
router.get('/swap-analytics', reportingController.getSwapAnalyticsReport);
router.get('/revenue-tracking', reportingController.getRevenueTrackingReport);
router.get('/feedback-analysis', reportingController.getFeedbackAnalysisReport);

// Custom reports
router.post('/custom', reportingController.generateCustomReport);

module.exports = router;
