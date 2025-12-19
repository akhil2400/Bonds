const AuthService = require('../services/AuthService');
const MagicLinkService = require('../services/MagicLinkService');
const { getAccessTokenOptions, getRefreshTokenOptions, getClearCookieOptions } = require('../utils/cookieConfig');

class AuthController {
  // Step 1: Initial signup - sends Magic Link, does NOT create user
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

      // Get client info for security
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      // Generate and send Magic Link
      const result = await MagicLinkService.generateAndSendSignupLink(
        email, 
        { name, password }, 
        ipAddress, 
        userAgent
      );

      res.status(200).json({
        success: true,
        message: result.message,
        email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email for security
        expiresAt: result.expiresAt,
        note: result.note
      });

    } catch (error) {
      next(error);
    }
  }

  // Step 2: Verify Magic Link and create user account
  async verifyMagicLink(req, res, next) {
    try {
      const { token } = req.body;

      // Validate required fields
      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Verification token is required'
        });
      }

      // Verify Magic Link
      const magicLinkResult = await MagicLinkService.verifyMagicLink(token);

      if (!magicLinkResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired verification link'
        });
      }

      const { email, type, userData } = magicLinkResult;

      if (type === 'signup') {
        // Create verified user account using stored data
        const result = await AuthService.registerUser({ 
          name: userData.name, 
          email: email, 
          password: userData.password, // Already hashed in MagicLinkService
          isVerified: true,
          isPasswordHashed: true // Flag to skip re-hashing
        });

        // Set JWT tokens in httpOnly cookies
        res.cookie('accessToken', result.accessToken, getAccessTokenOptions());
        res.cookie('refreshToken', result.refreshToken, getRefreshTokenOptions());

        res.status(201).json({
          success: true,
          message: 'Account created successfully! Welcome to BONDS.',
          user: result.user,
          // Include token for mobile fallback (when cookies don't work)
          token: result.accessToken
        });
      } else if (type === 'login') {
        // Handle magic link login
        const result = await AuthService.loginUserByEmail(email);

        // Set JWT tokens in httpOnly cookies
        res.cookie('accessToken', result.accessToken, getAccessTokenOptions());
        res.cookie('refreshToken', result.refreshToken, getRefreshTokenOptions());

        res.status(200).json({
          success: true,
          message: 'Login successful! Welcome back to BONDS.',
          user: result.user,
          token: result.accessToken
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid magic link type'
        });
      }

    } catch (error) {
      next(error);
    }
  }

  // Magic Link Login (passwordless)
  async magicLinkLogin(req, res, next) {
    try {
      const { email } = req.body;

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

      // Get client info for security
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      // Generate and send login magic link
      const result = await MagicLinkService.generateAndSendLoginLink(email, ipAddress, userAgent);

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

  // Step 1: Forgot Password - Send Magic Link
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

      // Get client info for security
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      // Generate and send password reset magic link
      const result = await MagicLinkService.generateAndSendPasswordResetLink(email, ipAddress, userAgent);

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



  // Step 2: Verify Password Reset Magic Link
  async verifyPasswordResetLink(req, res, next) {
    try {
      const { token } = req.body;

      // Validate required fields
      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Reset token is required'
        });
      }

      // Verify Magic Link
      const magicLinkResult = await MagicLinkService.verifyMagicLink(token);

      if (!magicLinkResult.success || magicLinkResult.type !== 'password_reset') {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired password reset link'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Password reset link verified successfully',
        email: magicLinkResult.email
      });

    } catch (error) {
      next(error);
    }
  }

  // Step 3: Reset Password with verified token
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      // Validate required fields
      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Reset token and new password are required'
        });
      }

      // Validate password strength
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long'
        });
      }

      // Verify Magic Link one more time
      const magicLinkResult = await MagicLinkService.verifyMagicLink(token);

      if (!magicLinkResult.success || magicLinkResult.type !== 'password_reset') {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired password reset link'
        });
      }

      // Update user password
      await AuthService.resetUserPassword(magicLinkResult.email, newPassword);

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