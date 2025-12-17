const AuthService = require('../services/AuthService');
const OTPService = require('../services/OTPService');
const { getAccessTokenOptions, getRefreshTokenOptions, getClearCookieOptions } = require('../utils/cookieConfig');

class AuthController {
  // Step 1: Initial signup - sends OTP, does NOT create user
  async signup(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Name, email, and password are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid email address'
        });
      }

      // Validate password strength
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long'
        });
      }

      // Check if user already exists
      const existingUser = await AuthService.checkUserExists(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'An account with this email already exists'
        });
      }

      // Generate and send OTP
      const result = await OTPService.generateAndSendOTP(email, name);

      res.status(200).json({
        success: true,
        message: result.message,
        email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email for security
        expiresAt: result.expiresAt
      });

    } catch (error) {
      next(error);
    }
  }

  // Step 2: Verify OTP and create user account
  async verifyOTP(req, res, next) {
    try {
      const { name, email, password, otp } = req.body;

      // Validate required fields
      if (!name || !email || !password || !otp) {
        return res.status(400).json({
          success: false,
          error: 'Name, email, password, and OTP are required'
        });
      }

      // Verify OTP
      const otpResult = await OTPService.verifyOTP(email, otp);

      if (!otpResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid verification code'
        });
      }

      // Create verified user account
      const result = await AuthService.registerUser({ 
        name, 
        email: otpResult.email, 
        password,
        isVerified: true 
      });

      // Set JWT tokens in httpOnly cookies
      res.cookie('accessToken', result.accessToken, getAccessTokenOptions());
      res.cookie('refreshToken', result.refreshToken, getRefreshTokenOptions());

      res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to Bonds.',
        user: result.user,
        // Include token for mobile fallback (when cookies don't work)
        token: result.accessToken
      });

    } catch (error) {
      next(error);
    }
  }

  // Resend OTP
  async resendOTP(req, res, next) {
    try {
      const { email, name } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      const result = await OTPService.resendOTP(email, name || 'Friend');

      res.status(200).json({
        success: true,
        message: result.message,
        email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
        expiresAt: result.expiresAt
      });

    } catch (error) {
      next(error);
    }
  }
  
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      const result = await AuthService.loginUser(email, password);

      // Set JWT tokens in httpOnly cookies
      const accessOptions = getAccessTokenOptions();
      const refreshOptions = getRefreshTokenOptions();
      
      console.log('🍪 Setting cookies with options:', { accessOptions, refreshOptions });
      
      res.cookie('accessToken', result.accessToken, accessOptions);
      res.cookie('refreshToken', result.refreshToken, refreshOptions);

      console.log('✅ Login successful for:', result.user.email);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: result.user,
        // Include token for mobile fallback (when cookies don't work)
        token: result.accessToken
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // Clear JWT cookies with proper options
      res.clearCookie('accessToken', getClearCookieOptions());
      res.clearCookie('refreshToken', getClearCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        user: req.user
      });
    } catch (error) {
      next(error);
    }
  }

  // Step 1: Forgot Password - Send OTP
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      // Validate required fields
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid email address'
        });
      }

      // Check if user exists
      const existingUser = await AuthService.checkUserExists(email);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          error: 'No account found with this email address'
        });
      }

      // Generate and send password reset OTP
      const result = await OTPService.generateAndSendPasswordResetOTP(email, existingUser.name);

      res.status(200).json({
        success: true,
        message: result.message,
        email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email for security
        expiresAt: result.expiresAt
      });

    } catch (error) {
      next(error);
    }
  }



  // Step 2: Reset Password with OTP
  async resetPassword(req, res, next) {
    try {
      const { email, otp, newPassword } = req.body;

      // Validate required fields
      if (!email || !otp || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Email, OTP, and new password are required'
        });
      }

      // Validate password strength
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long'
        });
      }

      // Verify OTP one more time
      const otpResult = await OTPService.verifyOTP(email, otp);

      if (!otpResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset code'
        });
      }

      // Update user password
      const result = await AuthService.resetUserPassword(otpResult.email, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully! You can now login with your new password.'
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();