const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateBroadcast, validateNotification, validateEmailCampaign } = require('../middleware/validation');

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'MODERATOR']));

// Broadcast messaging
router.post('/broadcast', validateBroadcast, communicationController.createBroadcastMessage);

// Targeted notifications
router.post('/notifications/targeted', validateNotification, communicationController.sendTargetedNotification);

// Email campaigns
router.post('/email/campaign', validateEmailCampaign, communicationController.createEmailCampaign);

// Push notifications
router.post('/push', communicationController.sendPushNotification);

// Communication history and stats
router.get('/history', communicationController.getCommunicationHistory);
router.get('/stats', communicationController.getCommunicationStats);

module.exports = router;
