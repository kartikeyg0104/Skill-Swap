const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { authenticateToken, requireVerification } = require('../middleware/auth');
const { validateVideoSession } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Video session routes
router.post('/sessions', requireVerification, validateVideoSession, videoController.createVideoSession);
router.get('/sessions', videoController.getVideoSessions);
router.get('/sessions/:sessionId/join', videoController.joinVideoSession);
router.post('/sessions/:sessionId/end', videoController.endVideoSession);
router.post('/sessions/:sessionId/recording', videoController.saveRecording);

module.exports = router;
