const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.initializeTransporter();
      this.initialized = true;
    }
  }

  async initializeTransporter() {
    // Check if real email credentials are provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && 
        process.env.EMAIL_USER !== 'your-email@gmail.com' && 
        process.env.EMAIL_PASSWORD !== 'your-16-character-app-password-here') {
      
      // Use real SMTP service (Gmail, SendGrid, etc.)
      console.log('🔧 Configuring real email service with Gmail...');
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      
      console.log(`📧 Real email configured for: ${process.env.EMAIL_USER}`);
    } else {
      // Development: Use Ethereal Email (fake SMTP for testing)
      console.log('🧪 Using test email service (Ethereal)...');
      await this.createTestAccount();
    }
  }

  async createTestAccount() {
    try {
      // Create test account for development
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      console.log('📧 Test email account created:');
      console.log('User:', testAccount.user);
      console.log('Pass:', testAccount.pass);
    } catch (error) {
      console.error('Failed to create test email account:', error);
      
      // Fallback: Create a basic transporter
      this.transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
        secure: false,
        ignoreTLS: true
      });
    }
  }

  async sendOTPEmail(email, otp, userName = 'Friend') {
    try {
      // Ensure transporter is initialized
      await this.initialize();

      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Bonds App" <noreply@bonds.app>',
        to: email,
        subject: 'Your Bonds Verification Code',
        html: this.generateOTPEmailTemplate(otp, userName)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      // Log preview URL for development
      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 Email sent successfully!');
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send verification email');
    }
  }

  generateOTPEmailTemplate(otp, userName) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bonds - Verification Code</title>
        <style>
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.6;
                color: #3A3A3A;
                background-color: #FBF9F7;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #FFFFFF;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 8px 32px rgba(107, 140, 174, 0.16);
            }
            .header {
                background: linear-gradient(135deg, #6B8CAE 0%, #A67B8C 100%);
                padding: 40px 30px;
                text-align: center;
            }
            .header h1 {
                color: white;
                margin: 0;
                font-size: 28px;
                font-weight: 600;
                letter-spacing: -0.02em;
            }
            .header p {
                color: rgba(255, 255, 255, 0.9);
                margin: 8px 0 0 0;
                font-size: 16px;
            }
            .content {
                padding: 40px 30px;
                text-align: center;
            }
            .greeting {
                font-size: 18px;
                color: #3A3A3A;
                margin-bottom: 20px;
            }
            .message {
                font-size: 16px;
                color: #5A5A5A;
                margin-bottom: 30px;
                line-height: 1.75;
            }
            .otp-container {
                background: linear-gradient(135deg, #F9F6F2 0%, #F5F2EE 100%);
                border: 2px solid #D4A574;
                border-radius: 16px;
                padding: 30px;
                margin: 30px 0;
                display: inline-block;
            }
            .otp-label {
                font-size: 14px;
                color: #8A8A8A;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 500;
            }
            .otp-code {
                font-size: 36px;
                font-weight: 700;
                color: #6B8CAE;
                letter-spacing: 8px;
                font-family: 'Monaco', 'Menlo', monospace;
                margin: 0;
            }
            .expiry {
                font-size: 14px;
                color: #A67B8C;
                margin-top: 20px;
                font-weight: 500;
            }
            .footer {
                background-color: #F9F6F2;
                padding: 30px;
                text-align: center;
                border-top: 1px solid rgba(166, 123, 140, 0.1);
            }
            .footer p {
                margin: 0;
                font-size: 14px;
                color: #8A8A8A;
            }
            .security-note {
                background-color: rgba(122, 155, 142, 0.08);
                border-left: 4px solid #7A9B8E;
                padding: 20px;
                margin: 30px 0;
                border-radius: 0 12px 12px 0;
            }
            .security-note p {
                margin: 0;
                font-size: 14px;
                color: #5A5A5A;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Bonds</h1>
                <p>Where friendships live forever</p>
            </div>
            
            <div class="content">
                <div class="greeting">Hello ${userName}! 👋</div>
                
                <div class="message">
                    Welcome to Bonds! We're excited to help you create beautiful memories with your friends.
                    <br><br>
                    Please use the verification code below to complete your registration:
                </div>
                
                <div class="otp-container">
                    <div class="otp-label">Verification Code</div>
                    <div class="otp-code">${otp}</div>
                </div>
                
                <div class="expiry">This code will expire in 5 minutes</div>
                
                <div class="security-note">
                    <p><strong>Security Note:</strong> Never share this code with anyone. Bonds will never ask for your verification code via phone or email.</p>
                </div>
            </div>
            
            <div class="footer">
                <p>Made with love for friendships that last a lifetime</p>
                <p style="margin-top: 10px; font-size: 12px;">
                    If you didn't request this code, please ignore this email.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  async verifyConnection() {
    try {
      await this.initialize();
      if (this.transporter) {
        await this.transporter.verify();
        console.log('✅ Email service is ready');
        return true;
      } else {
        console.log('⚠️ Email service not initialized yet');
        return false;
      }
    } catch (error) {
      console.error('❌ Email service verification failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();