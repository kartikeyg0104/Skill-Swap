const express = require('express');
const router = express.Router();
const messagingController = require('../controllers/messagingController');
const { authenticateToken } = require('../middleware/auth');
const { validateMessage } = require('../middleware/validation');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(authenticateToken);

// Messaging routes
router.post('/', validateMessage, upload.single('file'), messagingController.sendMessage);
router.get('/conversations', messagingController.getConversations);
router.get('/unread-count', messagingController.getUnreadCount);
router.get('/user/:userId', messagingController.getMessages);
router.put('/:messageId/read', messagingController.markAsRead);
router.delete('/:messageId', messagingController.deleteMessage);

module.exports = router;
