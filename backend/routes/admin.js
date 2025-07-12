const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'MODERATOR']));

// Dashboard routes
router.get('/dashboard', adminController.getDashboardStats);

// User management routes
router.get('/users', adminController.getUsers);
router.put('/users/:userId/status', adminController.updateUserStatus);

// Report management routes
router.get('/reports', adminController.getReports);
router.put('/reports/:reportId/resolve', adminController.resolveReport);

// Swap monitoring routes
router.get('/swaps', adminController.getSwapMonitoring);

// Content moderation routes
router.get('/content', adminController.getContentModeration);
router.post('/content/moderate', adminController.moderateContent);

// Admin action logs
router.get('/actions', requireRole(['ADMIN']), adminController.getAdminActions);

module.exports = router;
