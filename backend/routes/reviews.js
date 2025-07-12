const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticateToken, requireVerification } = require('../middleware/auth');
const { validateReview } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Review management (as per requirements)
router.post('/', requireVerification, validateReview, ratingController.createReviewForSwap);
router.get('/user/:userId', ratingController.getReviewsForUser);
router.get('/swap/:swapId', ratingController.getReviewsForSwap);
router.put('/:id', validateReview, ratingController.updateReview);
router.delete('/:id', ratingController.deleteReview);
router.post('/:id/helpful', ratingController.markReviewHelpful);

module.exports = router;
