const express = require('express');
const router = express.Router();
const swapRequestController = require('../controllers/swapRequestController');
const { authenticateToken, requireVerification } = require('../middleware/auth');
const { validateSwapRequest, validateScheduleSession } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Swap request management
router.post('/', requireVerification, validateSwapRequest, swapRequestController.createSwapRequest);
router.get('/', swapRequestController.getSwapRequests);
router.get('/stats', swapRequestController.getSwapRequestStats);
router.get('/:id', swapRequestController.getSwapRequest);
router.put('/:id/status', swapRequestController.updateSwapRequestStatus);
router.post('/:id/accept', swapRequestController.acceptSwapRequest);
router.post('/:id/decline', swapRequestController.declineSwapRequest);
router.post('/:id/schedule', validateScheduleSession, swapRequestController.scheduleSession);

module.exports = router;
