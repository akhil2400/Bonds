const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// OTP-based signup flow
router.post('/signup', AuthController.signup);           // Step 1: Send OTP
router.post('/verify-otp', AuthController.verifyOTP);    // Step 2: Verify OTP & create user
router.post('/resend-otp', AuthController.resendOTP);    // Resend OTP

// Authentication
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', require('../middlewares/auth'), AuthController.me);

module.exports = router;