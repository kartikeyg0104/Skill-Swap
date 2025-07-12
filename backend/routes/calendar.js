const express = require('express');
const { 
    initiateGoogleAuth, 
    handleGoogleCallback, 
    scheduleMeeting, 
    updateSession, 
    cancelSession, 
    getConnectionStatus 
} = require('../controllers/calendarController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// OAuth routes (callback doesn't need auth)
router.get('/auth', authenticateToken, initiateGoogleAuth);
router.get('/callback', handleGoogleCallback);
router.get('/connection', authenticateToken, getConnectionStatus);

// Meeting management routes (all need auth)
router.post('/schedule', authenticateToken, scheduleMeeting);
router.put('/session/:sessionId', authenticateToken, updateSession);
router.delete('/session/:sessionId', authenticateToken, cancelSession);

module.exports = router;
