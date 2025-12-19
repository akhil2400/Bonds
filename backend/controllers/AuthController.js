const AuthService = require('../services/AuthService');
const MagicLinkService = require('../services/MagicLinkService');
const { getAccessTokenOptions, getRefreshTokenOptions, getClearCookieOptions } = require('../utils/cookieConfig');

class AuthController {
  // Direct signup - creates user account immediately (no email verification)
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

      // Create user account directly (no email verification required)
      const result = await AuthService.registerUser({
        name,
        email,
        password,
        isVerified: true // Set as verified since we're skipping email verification
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully! Please sign in with your credentials.',
        user: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email
        },
        redirectTo: '/login'
      });

    } catch (error) {
      next(error);
    }
  }

  // COMMENTED OUT: Magic Link verification (not needed for direct signup)
  // async verifyMagicLink(req, res, next) {
  //   try {
  //     const { token } = req.body;
  //     // ... Magic Link verification logic ...
  //     // This endpoint is disabled since we're using direct signup
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // COMMENTED OUT: Magic Link Login (using traditional login only)
  // async magicLinkLogin(req, res, next) {
  //   try {
  //     // ... Magic Link login logic ...
  //     // This endpoint is disabled since we're using traditional email/password login
  //   } catch (error) {
  //     next(error);
  //   }
  // }
  
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