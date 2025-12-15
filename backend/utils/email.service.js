const { Resend } = require('resend');
const CustomError = require('../errors/CustomError');

class EmailService {
  constructor() {
    this.resend = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const apiKey = process.env.RESEND_API_KEY;
      
      if (!apiKey || apiKey === 'your-resend-api-key-here') {
        throw new Error('RESEND_API_KEY is not configured in environment variables');
      }

      this.resend = new Resend(apiKey);
      this.initialized = true;
      
      console.log('✅ Resend email service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Resend email service:', error.message);
      throw new CustomError('Email service initialization failed', 500);
    }
  }

  async sendOTP(email, otp, userName = 'Friend') {
    try {
      await this.initialize();

      // Use Resend default sender domain for production
      const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
      const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || 5;

      const emailContent = this.generateOTPEmailContent(otp, userName, expiryMinutes);

      const result = await this.resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Your BONDS Verification Code',
        text: emailContent.text
      });

      // Check for Resend API errors
      if (result.error) {
        console.error('❌ Resend API Error:', result.error);
        throw new Error(`Email delivery failed: ${result.error.message}`);
      }

      console.log('✅ Resend API Success:', result.data);
      console.log(`📧 OTP email sent successfully to: ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}`);

      return {
        success: true,
        messageId: result.data?.id || 'unknown',
        message: 'Verification code sent successfully'
      };

    } catch (error) {
      console.error('Email sending failed:', error.message);
      
      // Don't expose internal errors to client
      if (error.message.includes('API key') || error.message.includes('unauthorized')) {
        throw new CustomError('Email service configuration error', 500);
      }
      
      throw new CustomError('Failed to send verification email', 500);
    }
  }

  generateOTPEmailContent(otp, userName, expiryMinutes) {
    const text = `
Hello ${userName}!

Welcome to BONDS! We're excited to help you create beautiful memories with your friends.

Your verification code is: ${otp}

This code will expire in ${expiryMinutes} minutes.

Security Notice: This code is for your account only. Never share it with anyone. BONDS will never ask for your verification code via phone or other means.

If you didn't request this code, please ignore this email.

Made with love for friendships that last a lifetime.

---
BONDS - Where friendships live forever
    `.trim();

    return { text };
  }

  async verifyConnection() {
    try {
      await this.initialize();
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error.message);
      return false;
    }
  }
}

module.exports = new EmailService();