const express = require('express');
const router = express.Router();
const trustSafetyController = require('../controllers/trustSafetyController');
const { authenticateToken, requireVerification } = require('../middleware/auth');
const { validateReport, validateEndorsement } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Verification routes
router.post('/verification/request', trustSafetyController.requestVerification);
router.get('/verification/status', trustSafetyController.getVerificationStatus);

// Endorsement routes
router.post('/endorse', requireVerification, validateEndorsement, trustSafetyController.endorseSkill);

// Reporting routes
router.post('/report', validateReport, trustSafetyController.reportUser);

// Trust score routes
router.get('/trust-score/:userId', trustSafetyController.calculateTrustScore);

// Dispute routes
router.get('/disputes', trustSafetyController.getDisputes);
router.post('/disputes', trustSafetyController.createDispute);

module.exports = router;
