const nodemailer = require('nodemailer');
const CustomError = require('../errors/CustomError');

class MailerService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;

      if (!emailUser || !emailPass) {
        throw new Error('EMAIL_USER and EMAIL_PASS must be configured in environment variables');
      }

      // Create Nodemailer transporter with Gmail SMTP - Render optimized
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
          user: emailUser,
          pass: emailPass // Gmail App Password
        },
        // Render-optimized settings
        connectionTimeout: 30000,  // 30 seconds for slow connections
        greetingTimeout: 10000,    // 10 seconds
        socketTimeout: 30000,      // 30 seconds
        // Connection pooling disabled for better reliability
        pool: false,
        // TLS settings for better compatibility
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false
        },
        // Debug for troubleshooting
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development'
      });

      // Verify connection with longer timeout for Render
      const verifyPromise = this.transporter.verify();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gmail SMTP connection timeout - this is normal on Render free tier')), 15000)
      );
      
      await Promise.race([verifyPromise, timeoutPromise]);
      this.initialized = true;
      
      console.log('✅ Nodemailer service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Nodemailer service:', error.message);
      throw new CustomError('Email service initialization failed', 500);
    }
  }

  async sendOTP(email, otp, userName = 'Friend') {
    try {
      // Try to initialize, but don't fail if verification times out
      try {
        await this.initialize();
      } catch (initError) {
        console.log('⚠️ Email service verification failed, attempting direct send...');
        // Create transporter without verification for Render compatibility
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        
        if (!emailUser || !emailPass) {
          throw new Error('EMAIL_USER and EMAIL_PASS must be configured');
        }
        
        this.transporter = nodemailer.createTransporter({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: { user: emailUser, pass: emailPass },
          connectionTimeout: 30000,
          socketTimeout: 30000,
          pool: false,
          tls: { rejectUnauthorized: false }
        });
      }

      const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || 5;
      const emailContent = this.generateOTPEmailContent(otp, userName, expiryMinutes);

      const mailOptions = {
        from: {
          name: 'BONDS',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Your BONDS Verification Code',
        text: emailContent.text,
        html: emailContent.html
      };

      const result = await this.transporter.sendMail(mailOptions);

      console.log('✅ Nodemailer Success:', result.messageId);
      console.log(`📧 OTP email sent successfully to: ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}`);

      return {
        success: true,
        messageId: result.messageId,
        message: 'Verification code sent successfully'
      };

    } catch (error) {
      console.error('Email sending failed:', error.message);
      
      // Don't expose internal errors to client
      if (error.message.includes('authentication') || error.message.includes('credentials')) {
        throw new CustomError('Email service configuration error', 500);
      }
      
      throw new CustomError('Failed to send verification email', 500);
    }
  }

  async sendPasswordResetOTP(email, otp, userName = 'Friend') {
    try {
      // Try to initialize, but don't fail if verification times out
      try {
        await this.initialize();
      } catch (initError) {
        console.log('⚠️ Email service verification failed, attempting direct send...');
        // Create transporter without verification for Render compatibility
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        
        if (!emailUser || !emailPass) {
          throw new Error('EMAIL_USER and EMAIL_PASS must be configured');
        }
        
        this.transporter = nodemailer.createTransporter({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: { user: emailUser, pass: emailPass },
          connectionTimeout: 30000,
          socketTimeout: 30000,
          pool: false,
          tls: { rejectUnauthorized: false }
        });
      }

      const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || 5;
      const emailContent = this.generatePasswordResetEmailContent(otp, userName, expiryMinutes);

      const mailOptions = {
        from: {
          name: 'BONDS',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'BONDS Password Reset Code',
        text: emailContent.text,
        html: emailContent.html
      };

      const result = await this.transporter.sendMail(mailOptions);

      console.log('✅ Password reset email sent:', result.messageId);
      console.log(`🔐 Password reset OTP sent to: ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}`);

      return {
        success: true,
        messageId: result.messageId,
        message: 'Password reset code sent successfully'
      };

    } catch (error) {
      console.error('Password reset email failed:', error.message);
      
      // Don't expose internal errors to client
      if (error.message.includes('authentication') || error.message.includes('credentials')) {
        throw new CustomError('Email service configuration error', 500);
      }
      
      throw new CustomError('Failed to send password reset email', 500);
    }
  }

  generateOTPEmailContent(otp, userName, expiryMinutes) {
    const text = `
Hello ${userName}!

Welcome to BONDS! We're excited to help you preserve memories that matter the most.

Your verification code is: ${otp}

This code will expire in ${expiryMinutes} minutes.

Security Notice: This code is for your account only. Never share it with anyone. BONDS will never ask for your verification code via phone or other means.

If you didn't request this code, please ignore this email.

Made with love for friendships that last a lifetime.
— Team BONDS
    `.trim();

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>BONDS Verification</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f4f6f8;
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .container {
          max-width: 520px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
        }
        .header {
          background: linear-gradient(135deg, #ff9a9e, #fad0c4);
          padding: 28px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          letter-spacing: 1px;
        }
        .content {
          padding: 32px 28px;
          color: #333333;
        }
        .content p {
          font-size: 15px;
          line-height: 1.6;
          margin: 0 0 16px;
        }
        .otp-box {
          margin: 28px 0;
          text-align: center;
        }
        .otp {
          display: inline-block;
          background: #f1f3f6;
          color: #111827;
          font-size: 32px;
          letter-spacing: 6px;
          padding: 16px 28px;
          border-radius: 10px;
          font-weight: 700;
        }
        .expiry {
          font-size: 13px;
          color: #6b7280;
          text-align: center;
          margin-top: 12px;
        }
        .security {
          background: #fff7ed;
          border-left: 4px solid #fb923c;
          padding: 14px 16px;
          font-size: 13px;
          color: #7c2d12;
          border-radius: 6px;
          margin-top: 24px;
        }
        .footer {
          text-align: center;
          padding: 22px;
          font-size: 13px;
          color: #6b7280;
          background: #fafafa;
        }
        .footer strong {
          color: #111827;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>BONDS</h1>
          <p>Where friendships live forever</p>
        </div>

        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>

          <p>
            Welcome to <strong>BONDS</strong> 💛  
            We're excited to have you here and help you preserve memories
            that matter the most.
          </p>

          <p>Please use the verification code below to continue:</p>

          <div class="otp-box">
            <div class="otp">${otp}</div>
            <div class="expiry">
              This code expires in ${expiryMinutes} minutes
            </div>
          </div>

          <div class="security">
            🔒 <strong>Security notice:</strong><br />
            This code is meant only for you. Never share it with anyone.
            BONDS will never ask for your OTP through calls, messages, or emails.
          </div>

          <p style="margin-top: 26px;">
            If you didn't request this verification, you can safely ignore this email.
          </p>
        </div>

        <div class="footer">
          Made with ❤️ for friendships that last a lifetime<br />
          <strong>— Team BONDS</strong>
        </div>
      </div>
    </body>
    </html>
    `;

    return { text, html };
  }

  generatePasswordResetEmailContent(otp, userName, expiryMinutes) {
    const text = `
Hello ${userName}!

We received a request to reset your password for your BONDS account.

Your password reset code is: ${otp}

This code will expire in ${expiryMinutes} minutes.

If you didn't request a password reset, please ignore this email and your password will remain unchanged.

For security reasons, never share this code with anyone.

— Team BONDS
    `.trim();

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>BONDS Password Reset</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f4f6f8;
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .container {
          max-width: 520px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
        }
        .header {
          background: linear-gradient(135deg, #667eea, #764ba2);
          padding: 28px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          letter-spacing: 1px;
        }
        .content {
          padding: 32px 28px;
          color: #333333;
        }
        .content p {
          font-size: 15px;
          line-height: 1.6;
          margin: 0 0 16px;
        }
        .otp-box {
          margin: 28px 0;
          text-align: center;
        }
        .otp {
          display: inline-block;
          background: #f1f3f6;
          color: #111827;
          font-size: 32px;
          letter-spacing: 6px;
          padding: 16px 28px;
          border-radius: 10px;
          font-weight: 700;
        }
        .expiry {
          font-size: 13px;
          color: #6b7280;
          text-align: center;
          margin-top: 12px;
        }
        .security {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 14px 16px;
          font-size: 13px;
          color: #7f1d1d;
          border-radius: 6px;
          margin-top: 24px;
        }
        .footer {
          text-align: center;
          padding: 22px;
          font-size: 13px;
          color: #6b7280;
          background: #fafafa;
        }
        .footer strong {
          color: #111827;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 BONDS</h1>
          <p>Password Reset Request</p>
        </div>

        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>

          <p>
            We received a request to reset your password for your <strong>BONDS</strong> account.
          </p>

          <p>Please use the verification code below to reset your password:</p>

          <div class="otp-box">
            <div class="otp">${otp}</div>
            <div class="expiry">
              This code expires in ${expiryMinutes} minutes
            </div>
          </div>

          <div class="security">
            🔒 <strong>Security notice:</strong><br />
            If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            Never share this code with anyone.
          </div>

          <p style="margin-top: 26px;">
            For your account security, this code can only be used once.
          </p>
        </div>

        <div class="footer">
          Made with ❤️ for friendships that last a lifetime<br />
          <strong>— Team BONDS</strong>
        </div>
      </div>
    </body>
    </html>
    `;

    return { text, html };
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

module.exports = new MailerService();