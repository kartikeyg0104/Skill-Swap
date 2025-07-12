const express = require('express');
const router = express.Router();
const swapRequestController = require('../controllers/swapRequestController');
const { authenticateToken, requireVerification } = require('../middleware/auth');
const { validateSwapRequest } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Swap request management (as per requirements)
router.post('/', requireVerification, validateSwapRequest, swapRequestController.createSwapRequest);
router.get('/sent', swapRequestController.getSentSwapRequests);
router.get('/received', swapRequestController.getReceivedSwapRequests);
router.get('/:id', swapRequestController.getSwapRequest);
router.put('/:id/accept', swapRequestController.acceptSwapRequest);
router.put('/:id/decline', swapRequestController.declineSwapRequest);
router.delete('/:id', swapRequestController.cancelSwapRequest);
router.put('/:id/status', swapRequestController.updateSwapRequestStatus);

module.exports = router;
