const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireVerification } = require('../middleware/auth');
const { validateProfile } = require('../middleware/validation');
const upload = require('../middleware/upload');

// Profile management
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', 
  authenticateToken, 
  upload.single('profilePhoto'), 
  validateProfile, 
  userController.updateProfile
);

// Availability
router.put('/availability', authenticateToken, userController.updateAvailability);

// Password and account management
router.put('/password', authenticateToken, userController.changePassword);
router.delete('/account', authenticateToken, userController.deleteAccount);

module.exports = router;
