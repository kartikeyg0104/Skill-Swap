const express = require('express');
const { 
    scheduleSimpleMeeting,
    getUserMeetings,
    updateMeetingStatus
} = require('../controllers/simpleMeetingController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Schedule a simple meeting
router.post('/schedule', scheduleSimpleMeeting);

// Get user's meetings
router.get('/my-meetings', getUserMeetings);

// Update meeting status
router.patch('/:meetingId/status', updateMeetingStatus);

module.exports = router;
