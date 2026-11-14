const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const rateLimiter = require('../middleware/rateLimiter');
const validateRequest = require('../middleware/validateRequest');
const { loginValidator } = require('../validators/authValidator');

// Login rate limited to 15 attempts per 15 minutes
const loginLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many login attempts. Please try again after 15 minutes.',
});

router.post('/login', loginLimiter, loginValidator, validateRequest, authController.login);
router.get('/me', authenticate, authController.getProfile);
router.get('/profile', authenticate, authController.getProfile); // Alias for compatibility
router.post('/logout', authenticate, authController.logout);

module.exports = router;
