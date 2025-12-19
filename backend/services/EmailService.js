const { Resend } = require('resend');
const CustomError = require('../errors/CustomError');

class EmailService {
  constructor() {
    this.resend = null;
    this.initialized = false;
    this.fromEmail = 'BONDS <noreply@bonds-app.com>'; // Update with your verified domain
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const apiKey = process.env.RESEND_API_KEY;
      
      if (!apiKey || apiKey.includes('PLACEHOLDER')) {
        throw new Error('RESEND_API_KEY must be configured with a valid API key from Resend.com');
      }

      this.resend = new Resend(apiKey);
      this.initialized = true;
      
      console.log('✅ Resend email service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Resend service:', error.message);
      throw new CustomError('Email service initialization failed', 500);
    }
  }

  async sendMagicLink(email, magicLink, userName = 'Friend', type = 'signup') {
    try {
      await this.initialize();

      const emailContent = this.generateMagicLinkEmailContent(magicLink, userName, type);
      const subject = this.getEmailSubject(type);

      const emailData = {
        from: this.fromEmail,
        to: email,
        subject: subject,
        text: emailContent.text,
        html: emailContent.html
      };

      const result = await this.resend.emails.send(emailData);
      
      console.log('✅ Magic link email sent successfully:', result.id);
      console.log(`📧 Magic link sent to: ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}`);

      return {
        success: true,
        messageId: result.id,
        message: 'Magic link sent successfully'
      };

    } catch (error) {
      console.error('❌ Magic link email failed:', error.message);
      
      // Log the magic link for development/testing if email fails
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
        console.log('🔍 FALLBACK - Magic Link Details for Testing:');
        console.log('📧 Email:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));
        console.log('🔗 Magic Link:', magicLink);
        console.log('👤 User:', userName);
        console.log('📝 Type:', type);
        console.log('💡 Use this link if email delivery fails');
      }
      
      // Don't throw error - allow signup to continue
      return {
        success: false,
        error: error.message,
        message: 'Email delivery failed, but magic link was generated'
      };
    }
  }

  getEmailSubject(type) {
    switch (type) {
      case 'signup':
        return 'Complete your BONDS registration';
      case 'login':
        return 'Your BONDS login link';
      case 'password_reset':
        return 'Reset your BONDS password';
      default:
        return 'Your BONDS verification link';
    }
  }

  generateMagicLinkEmailContent(magicLink, userName, type) {
    const actionText = this.getActionText(type);
    const headerText = this.getHeaderText(type);
    const descriptionText = this.getDescriptionText(type);

    const text = `
Hello ${userName}!

${descriptionText}

Click the link below to ${actionText.toLowerCase()}:
${magicLink}

This link will expire in 10 minutes for your security.

If you didn't request this, please ignore this email.

Made with love for friendships that last a lifetime.
— Team BONDS
    `.trim();

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>BONDS ${headerText}</title>
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
          background: ${this.getHeaderGradient(type)};
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
        .magic-link-box {
          margin: 28px 0;
          text-align: center;
        }
        .magic-link-btn {
          display: inline-block;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #ffffff;
          text-decoration: none;
          font-size: 16px;
          font-weight: 600;
          padding: 16px 32px;
          border-radius: 10px;
          transition: transform 0.2s;
        }
        .magic-link-btn:hover {
          transform: translateY(-2px);
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
        .fallback-link {
          margin-top: 16px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
          font-size: 12px;
          color: #6b7280;
          word-break: break-all;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${this.getHeaderIcon(type)} BONDS</h1>
          <p>${headerText}</p>
        </div>

        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>

          <p>${descriptionText}</p>

          <div class="magic-link-box">
            <a href="${magicLink}" class="magic-link-btn">
              ${actionText}
            </a>
            <div class="expiry">
              This link expires in 10 minutes
            </div>
          </div>

          <div class="security">
            🔒 <strong>Security notice:</strong><br />
            This link is meant only for you and can only be used once.
            If you didn't request this, please ignore this email.
          </div>

          <div class="fallback-link">
            <strong>Link not working?</strong><br />
            Copy and paste this URL into your browser:<br />
            ${magicLink}
          </div>
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

  getActionText(type) {
    switch (type) {
      case 'signup':
        return 'Complete Registration';
      case 'login':
        return 'Sign In to BONDS';
      case 'password_reset':
        return 'Reset Password';
      default:
        return 'Verify Account';
    }
  }

  getHeaderText(type) {
    switch (type) {
      case 'signup':
        return 'Welcome to BONDS!';
      case 'login':
        return 'Sign in to your account';
      case 'password_reset':
        return 'Password Reset';
      default:
        return 'Account Verification';
    }
  }

  getDescriptionText(type) {
    switch (type) {
      case 'signup':
        return "Welcome to BONDS! We're excited to help you preserve memories that matter the most. Click the button below to complete your registration.";
      case 'login':
        return "Click the button below to securely sign in to your BONDS account.";
      case 'password_reset':
        return "We received a request to reset your password. Click the button below to set a new password for your account.";
      default:
        return "Click the button below to verify your account.";
    }
  }

  getHeaderGradient(type) {
    switch (type) {
      case 'signup':
        return 'linear-gradient(135deg, #ff9a9e, #fad0c4)';
      case 'login':
        return 'linear-gradient(135deg, #a8edea, #fed6e3)';
      case 'password_reset':
        return 'linear-gradient(135deg, #667eea, #764ba2)';
      default:
        return 'linear-gradient(135deg, #ff9a9e, #fad0c4)';
    }
  }

  getHeaderIcon(type) {
    switch (type) {
      case 'signup':
        return '🎉';
      case 'login':
        return '🔐';
      case 'password_reset':
        return '🔑';
      default:
        return '✨';
    }
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