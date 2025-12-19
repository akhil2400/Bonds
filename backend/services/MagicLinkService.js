const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const MagicLinkRepository = require('../repositories/MagicLinkRepository');
const EmailService = require('./EmailService');
const CustomError = require('../errors/CustomError');

class MagicLinkService {
  constructor() {
    this.MAGIC_LINK_EXPIRY_MINUTES = 10;
    this.RATE_LIMIT_WINDOW = 5; // minutes
    this.MAX_LINKS_PER_WINDOW = 3;
    this.TOKEN_LENGTH = 32; // bytes (will be 64 hex characters)
  }

  // Generate cryptographically secure token
  generateSecureToken() {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString('hex');
  }

  // Hash token for secure storage
  async hashToken(token) {
    const saltRounds = 12;
    return await bcrypt.hash(token, saltRounds);
  }

  // Verify token against hash
  async verifyTokenHash(plainToken, hashedToken) {
    return await bcrypt.compare(plainToken, hashedToken);
  }

  // Check rate limiting
  async checkRateLimit(email) {
    const count = await MagicLinkRepository.countActiveByEmail(email, this.RATE_LIMIT_WINDOW);
    if (count >= this.MAX_LINKS_PER_WINDOW) {
      throw new CustomError(
        `Too many magic link requests. Please wait ${this.RATE_LIMIT_WINDOW} minutes before requesting again.`,
        429
      );
    }
  }

  // Generate magic link URL
  generateMagicLinkUrl(token, type = 'signup') {
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const endpoint = type === 'password_reset' ? 'reset-password' : 'verify';
    return `${frontendUrl}/${endpoint}?token=${token}`;
  }

  // Generate and send magic link for signup
  async generateAndSendSignupLink(email, userData, ipAddress, userAgent) {
    try {
      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // Check rate limiting
      await this.checkRateLimit(normalizedEmail);

      // Generate secure token
      const plainToken = this.generateSecureToken();
      const hashedToken = await this.hashToken(plainToken);

      // Calculate expiry
      const expiresAt = new Date(Date.now() + this.MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000);

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Delete any existing magic links for this email
      await MagicLinkRepository.deleteByEmail(normalizedEmail);

      // Create new magic link record
      const magicLinkRecord = await MagicLinkRepository.create({
        email: normalizedEmail,
        tokenHash: hashedToken,
        expiresAt,
        type: 'signup',
        userData: {
          name: userData.name,
          password: hashedPassword
        },
        ipAddress,
        userAgent,
        isUsed: false
      });

      // Generate magic link URL
      const magicLinkUrl = this.generateMagicLinkUrl(plainToken, 'signup');

      // Send email asynchronously (non-blocking for better UX)
      EmailService.sendMagicLink(normalizedEmail, magicLinkUrl, userData.name, 'signup')
        .then((emailResult) => {
          if (emailResult.success) {
            console.log(`✅ Signup magic link email sent successfully to: ${normalizedEmail.replace(/(.{2}).*(@.*)/, '$1***$2')}`);
            console.log(`📧 Message ID: ${emailResult.messageId}`);
          } else {
            console.log(`⚠️ Email delivery failed, but magic link generated: ${emailResult.message}`);
          }
        })
        .catch((emailError) => {
          console.error(`❌ Failed to send magic link email to: ${normalizedEmail.replace(/(.{2}).*(@.*)/, '$1***$2')}`);
          console.error(`📧 Email error: ${emailError.message}`);
        });

      console.log(`🔗 Magic link generated for signup: ${normalizedEmail.replace(/(.{2}).*(@.*)/, '$1***$2')} (email sending in background)`);

      return {
        success: true,
        message: 'Magic link is being sent to your email',
        linkId: magicLinkRecord._id,
        expiresAt,
        note: 'Please check your email and click the verification link'
      };

    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error('Error in generateAndSendSignupLink:', error);
      throw new CustomError('Failed to send verification link', 500);
    }
  }

  // Generate and send magic link for login
  async generateAndSendLoginLink(email, ipAddress, userAgent) {
    try {
      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // Check rate limiting
      await this.checkRateLimit(normalizedEmail);

      // Generate secure token
      const plainToken = this.generateSecureToken();
      const hashedToken = await this.hashToken(plainToken);

      // Calculate expiry
      const expiresAt = new Date(Date.now() + this.MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000);

      // Delete any existing magic links for this email
      await MagicLinkRepository.deleteByEmail(normalizedEmail);

      // Create new magic link record
      const magicLinkRecord = await MagicLinkRepository.create({
        email: normalizedEmail,
        tokenHash: hashedToken,
        expiresAt,
        type: 'login',
        ipAddress,
        userAgent,
        isUsed: false
      });

      // Generate magic link URL
      const magicLinkUrl = this.generateMagicLinkUrl(plainToken, 'login');

      // Send email asynchronously
      EmailService.sendMagicLink(normalizedEmail, magicLinkUrl, 'Friend', 'login')
        .then((emailResult) => {
          if (emailResult.success) {
            console.log(`✅ Login magic link email sent successfully to: ${normalizedEmail.replace(/(.{2}).*(@.*)/, '$1***$2')}`);
          }
        })
        .catch((emailError) => {
          console.error(`❌ Failed to send login magic link: ${emailError.message}`);
        });

      console.log(`🔗 Login magic link generated for: ${normalizedEmail.replace(/(.{2}).*(@.*)/, '$1***$2')}`);

      return {
        success: true,
        message: 'Magic link sent to your email',
        linkId: magicLinkRecord._id,
        expiresAt
      };

    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error('Error in generateAndSendLoginLink:', error);
      throw new CustomError('Failed to send login link', 500);
    }
  }

  // Generate and send magic link for password reset
  async generateAndSendPasswordResetLink(email, ipAddress, userAgent) {
    try {
      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // Check rate limiting
      await this.checkRateLimit(normalizedEmail);

      // Generate secure token
      const plainToken = this.generateSecureToken();
      const hashedToken = await this.hashToken(plainToken);

      // Calculate expiry
      const expiresAt = new Date(Date.now() + this.MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000);

      // Delete any existing magic links for this email
      await MagicLinkRepository.deleteByEmail(normalizedEmail);

      // Create new magic link record
      const magicLinkRecord = await MagicLinkRepository.create({
        email: normalizedEmail,
        tokenHash: hashedToken,
        expiresAt,
        type: 'password_reset',
        ipAddress,
        userAgent,
        isUsed: false
      });

      // Generate magic link URL
      const magicLinkUrl = this.generateMagicLinkUrl(plainToken, 'password_reset');

      // Send email asynchronously
      EmailService.sendMagicLink(normalizedEmail, magicLinkUrl, 'Friend', 'password_reset')
        .then((emailResult) => {
          if (emailResult.success) {
            console.log(`✅ Password reset magic link sent to: ${normalizedEmail.replace(/(.{2}).*(@.*)/, '$1***$2')}`);
          }
        })
        .catch((emailError) => {
          console.error(`❌ Failed to send password reset magic link: ${emailError.message}`);
        });

      console.log(`🔑 Password reset magic link generated for: ${normalizedEmail.replace(/(.{2}).*(@.*)/, '$1***$2')}`);

      return {
        success: true,
        message: 'Password reset link sent to your email',
        linkId: magicLinkRecord._id,
        expiresAt
      };

    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error('Error in generateAndSendPasswordResetLink:', error);
      throw new CustomError('Failed to send password reset link', 500);
    }
  }

  // Verify magic link token
  async verifyMagicLink(token) {
    try {
      // Find all active magic links and compare token with each hash
      const allActiveLinks = await MagicLinkRepository.findByEmail('', 0);
      
      for (const link of allActiveLinks) {
        if (link.isValid() && await this.verifyTokenHash(token, link.tokenHash)) {
          // Mark as used and return
          await link.markAsUsed();
          
          console.log(`✅ Magic link verified successfully for: ${link.email} (${link.type})`);
          
          return {
            success: true,
            message: 'Magic link verified successfully',
            email: link.email,
            type: link.type,
            userData: link.userData
          };
        }
      }
      
      throw new CustomError('Invalid or expired verification link', 400);

    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error('Error in verifyMagicLink:', error);
      throw new CustomError('Magic link verification failed', 500);
    }
  }

  // Clean expired magic links (maintenance)
  async cleanExpiredLinks() {
    try {
      const result = await MagicLinkRepository.cleanExpired();
      console.log(`🧹 Cleaned expired magic links: ${result.deletedCount}`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning expired magic links:', error);
      return 0;
    }
  }

  // Get magic link statistics
  async getMagicLinkStats() {
    try {
      const stats = await MagicLinkRepository.getStats();
      return stats[0] || {
        total: 0,
        used: 0,
        expired: 0,
        active: 0
      };
    } catch (error) {
      console.error('Error getting magic link stats:', error);
      return { total: 0, used: 0, expired: 0, active: 0 };
    }
  }
}

module.exports = new MagicLinkService();