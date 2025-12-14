const bcrypt = require('bcryptjs');
const OtpRepository = require('../repositories/OtpRepository');
const Mailer = require('../utils/mailer');
const CustomError = require('../errors/CustomError');

class OTPService {
  constructor() {
    this.OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
    this.MAX_OTP_ATTEMPTS = 3;
    this.RATE_LIMIT_WINDOW = 5; // minutes
    this.MAX_OTPS_PER_WINDOW = 3;
  }

  // Generate secure 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Hash OTP for secure storage
  async hashOTP(otp) {
    const saltRounds = 12;
    return await bcrypt.hash(otp, saltRounds);
  }

  // Verify OTP against hash
  async verifyOTPHash(plainOTP, hashedOTP) {
    return await bcrypt.compare(plainOTP, hashedOTP);
  }

  // Check rate limiting
  async checkRateLimit(email) {
    const count = await OtpRepository.countActiveByEmail(email, this.RATE_LIMIT_WINDOW);
    if (count >= this.MAX_OTPS_PER_WINDOW) {
      throw new CustomError(
        `Too many OTP requests. Please wait ${this.RATE_LIMIT_WINDOW} minutes before requesting again.`,
        429
      );
    }
  }

  // Generate and send OTP
  async generateAndSendOTP(email, userName = 'Friend') {
    try {
      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // Check rate limiting
      await this.checkRateLimit(normalizedEmail);

      // Generate OTP
      const plainOTP = this.generateOTP();
      const hashedOTP = await this.hashOTP(plainOTP);

      // Calculate expiry
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // Delete any existing OTPs for this email
      await OtpRepository.deleteByEmail(normalizedEmail);

      // Create new OTP record
      const otpRecord = await OtpRepository.create({
        email: normalizedEmail,
        otp: hashedOTP,
        expiresAt,
        isUsed: false,
        attempts: 0
      });

      // Send email
      const emailResult = await Mailer.sendOTP(normalizedEmail, plainOTP, userName);

      console.log(`📧 OTP generated and sent to: ${normalizedEmail}`);

      return {
        success: true,
        message: 'Verification code sent to your email',
        otpId: otpRecord._id,
        expiresAt,
        previewUrl: emailResult.previewUrl // For development
      };

    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error('Error in generateAndSendOTP:', error);
      throw new CustomError('Failed to send verification code', 500);
    }
  }

  // Verify OTP
  async verifyOTP(email, providedOTP) {
    try {
      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // Find latest valid OTP
      const otpRecord = await OtpRepository.findByEmail(normalizedEmail);

      if (!otpRecord) {
        throw new CustomError('Invalid or expired verification code', 400);
      }

      // Check if OTP is still valid
      if (!otpRecord.isValid()) {
        if (otpRecord.expiresAt <= new Date()) {
          throw new CustomError('Verification code has expired', 400);
        }
        if (otpRecord.attempts >= this.MAX_OTP_ATTEMPTS) {
          throw new CustomError('Too many failed attempts. Please request a new code.', 400);
        }
      }

      // Verify OTP
      const isValidOTP = await this.verifyOTPHash(providedOTP, otpRecord.otp);

      if (!isValidOTP) {
        // Increment attempts
        await otpRecord.incrementAttempts();
        
        const remainingAttempts = this.MAX_OTP_ATTEMPTS - (otpRecord.attempts + 1);
        if (remainingAttempts > 0) {
          throw new CustomError(
            `Invalid verification code. ${remainingAttempts} attempts remaining.`,
            400
          );
        } else {
          throw new CustomError(
            'Invalid verification code. Maximum attempts exceeded. Please request a new code.',
            400
          );
        }
      }

      // Mark OTP as used
      await otpRecord.markAsUsed();

      console.log(`✅ OTP verified successfully for: ${normalizedEmail}`);

      return {
        success: true,
        message: 'Verification code verified successfully',
        email: normalizedEmail
      };

    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error('Error in verifyOTP:', error);
      throw new CustomError('Verification failed', 500);
    }
  }

  // Clean expired OTPs (maintenance)
  async cleanExpiredOTPs() {
    try {
      const result = await OtpRepository.cleanExpired();
      console.log(`🧹 Cleaned expired OTPs: ${result.deletedCount}`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning expired OTPs:', error);
      return 0;
    }
  }

  // Get OTP statistics
  async getOTPStats() {
    try {
      const stats = await OtpRepository.getStats();
      return stats[0] || {
        total: 0,
        used: 0,
        expired: 0,
        active: 0
      };
    } catch (error) {
      console.error('Error getting OTP stats:', error);
      return { total: 0, used: 0, expired: 0, active: 0 };
    }
  }

  // Resend OTP (with rate limiting)
  async resendOTP(email, userName = 'Friend') {
    // Delete existing OTP first to reset attempts
    await OtpRepository.deleteByEmail(email.toLowerCase().trim());
    
    // Generate and send new OTP
    return await this.generateAndSendOTP(email, userName);
  }
}

module.exports = new OTPService();