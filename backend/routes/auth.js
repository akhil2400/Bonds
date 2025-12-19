const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// Direct signup flow (no email verification)
router.post('/signup', AuthController.signup);                    // Direct account creation

// Authentication
router.post('/login', AuthController.login);                      // Traditional email/password login
router.post('/logout', AuthController.logout);
router.get('/me', require('../middlewares/auth'), AuthController.me);

// COMMENTED OUT: Magic Link endpoints (not needed for direct signup/login)
// router.post('/verify-magic-link', AuthController.verifyMagicLink); // Magic Link verification
// router.post('/magic-login', AuthController.magicLinkLogin);       // Magic Link login (passwordless)
// router.post('/forgot-password', AuthController.forgotPassword);           // Send reset Magic Link
// router.post('/verify-reset-link', AuthController.verifyPasswordResetLink); // Verify reset link
// router.post('/reset-password', AuthController.resetPassword);             // Reset password with verified token

module.exports = router;