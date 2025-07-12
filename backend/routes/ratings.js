const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticateToken, requireVerification } = require('../middleware/auth');
const { validateReview } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Review management
router.post('/swap-requests/:swapRequestId/reviews', 
  requireVerification, 
  validateReview, 
  ratingController.createReview
);

router.get('/users/:userId/reviews', ratingController.getReviews);
router.get('/users/:userId/rating-stats', ratingController.getUserRatingStats);

// Review interactions
router.post('/reviews/:reviewId/helpful', ratingController.markReviewHelpful);
router.post('/reviews/:reviewId/report', ratingController.reportReview);

module.exports = router;
