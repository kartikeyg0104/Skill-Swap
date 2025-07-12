const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const communityController = require('../controllers/communityController');
const { authenticateToken } = require('../middleware/auth');
const { validateSocialShare, validateReferral, validatePost, validateComment } = require('../middleware/validation');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(authenticateToken);

// Community Features - Posts
router.post('/posts', upload.single('image'), validatePost, communityController.createPost);
router.get('/feed', communityController.getFeed);
router.get('/posts/public', communityController.getPublicFeed);
router.post('/posts/:postId/like', communityController.toggleLike);
router.post('/posts/:postId/bookmark', communityController.toggleBookmark);
router.post('/posts/:postId/comments', validateComment, communityController.addComment);
router.get('/posts/:postId/comments', communityController.getComments);

// Community Features - Following
router.post('/users/:userId/follow', communityController.toggleFollow);
router.get('/users/:userId/followers', communityController.getFollowers);
router.get('/users/:userId/following', communityController.getFollowing);
router.get('/users/:userId/stats', communityController.getUserSocialStats);
router.get('/suggested-users', communityController.getSuggestedUsers);

// Community Features - Trending
router.get('/trending', communityController.getTrendingTopics);

// Social sharing routes (existing)
router.post('/share/profile', validateSocialShare, socialController.shareProfile);
router.post('/share/skill', validateSocialShare, socialController.shareSkill);
router.post('/share/success', validateSocialShare, socialController.shareSwapSuccess);
router.post('/share/achievement', validateSocialShare, socialController.shareAchievement);

// Referral routes (existing)
router.post('/referral', validateReferral, socialController.generateReferralLink);

// Social profile management (existing)
router.post('/import-profile', socialController.importSocialProfile);
router.post('/find-connections', socialController.findSocialConnections);

// Social statistics (existing)
router.get('/stats', socialController.getSocialStats);

module.exports = router;
