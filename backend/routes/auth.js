const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// Magic Link-based signup flow
router.post('/signup', AuthController.signup);                    // Step 1: Send Magic Link
router.post('/verify-magic-link', AuthController.verifyMagicLink); // Step 2: Verify Magic Link & create user

// Authentication
router.post('/login', AuthController.login);                      // Traditional login (still available)
router.post('/magic-login', AuthController.magicLinkLogin);       // Magic Link login (passwordless)
router.post('/logout', AuthController.logout);
router.get('/me', require('../middlewares/auth'), AuthController.me);

// Password Reset with Magic Links
router.post('/forgot-password', AuthController.forgotPassword);           // Step 1: Send reset Magic Link
router.post('/verify-reset-link', AuthController.verifyPasswordResetLink); // Step 2: Verify reset link
router.post('/reset-password', AuthController.resetPassword);             // Step 3: Reset password with verified token

module.exports = router;