const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const { authenticateToken } = require('../middleware/auth');
const { validateSocialShare, validateReferral } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Social sharing routes
router.post('/share/profile', validateSocialShare, socialController.shareProfile);
router.post('/share/skill', validateSocialShare, socialController.shareSkill);
router.post('/share/success', validateSocialShare, socialController.shareSwapSuccess);
router.post('/share/achievement', validateSocialShare, socialController.shareAchievement);

// Referral routes
router.post('/referral', validateReferral, socialController.generateReferralLink);

// Social profile management
router.post('/import-profile', socialController.importSocialProfile);
router.post('/find-connections', socialController.findSocialConnections);

// Social statistics
router.get('/stats', socialController.getSocialStats);

module.exports = router;
