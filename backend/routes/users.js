const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const skillController = require('../controllers/skillController');
const { authenticateToken, requireVerification } = require('../middleware/auth');
const { validateProfile, validateSkill } = require('../middleware/validation');
const upload = require('../middleware/upload');

// Public profile routes
router.get('/:id', userController.getPublicProfile);

// Protected user routes (require authentication)
router.use(authenticateToken);

// Profile management
router.put('/:id', validateProfile, userController.updateUserProfile);
router.post('/upload-photo', upload.single('profilePhoto'), userController.uploadProfilePhoto);

// User's own skill management
router.get('/skills', skillController.getUserSkills);
router.post('/skills', requireVerification, validateSkill, skillController.addUserSkill);
router.put('/skills/:id', validateSkill, skillController.updateUserSkill);
router.delete('/skills/:id', skillController.deleteUserSkill);

module.exports = router;
