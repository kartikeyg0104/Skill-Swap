const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// Registration and login
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticateToken, authController.logout);

// Email verification
router.post('/verify-email/:token', authenticateToken, authController.verifyEmail);

// Get current user
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
