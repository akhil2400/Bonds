const nodemailer = require('nodemailer');

class Mailer {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Try Gmail first if credentials are available
      if (this.hasProductionCredentials()) {
        console.log('🔧 Attempting Gmail SMTP configuration...');
        await this.createGmailTransporter();
        this.initialized = true;
        return;
      }
      
      // Fallback to test email
      console.log('⚠️  No Gmail credentials found, using test email service');
      await this.createTestTransporter();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize mailer:', error);
      
      // Last resort: try test email
      try {
        console.log('🔄 Attempting fallback to test email...');
        await this.createTestTransporter();
        this.initialized = true;
      } catch (fallbackError) {
        console.error('Even test email failed:', fallbackError);
        throw new Error('Email service initialization failed completely');
      }
    }
  }

  hasProductionCredentials() {
    const hasUser = process.env.EMAIL_USER && 
                   process.env.EMAIL_USER !== 'your-email@gmail.com' &&
                   process.env.EMAIL_USER.includes('@');
    
    const hasPass = process.env.EMAIL_PASS && 
                   process.env.EMAIL_PASS !== 'your-16-character-app-password-here' &&
                   process.env.EMAIL_PASS !== 'temp-password-needs-real-setup' &&
                   process.env.EMAIL_PASS.length >= 12; // Gmail app passwords are typically 16 chars but allow some flexibility
    
    console.log('📧 Credential check:', {
      hasUser,
      hasPass,
      userLength: process.env.EMAIL_USER?.length || 0,
      passLength: process.env.EMAIL_PASS?.length || 0
    });
    
    return hasUser && hasPass;
  }

  async createGmailTransporter() {
    console.log('🔧 Configuring Gmail SMTP...');
    console.log(`📧 Using email: ${process.env.EMAIL_USER}`);
    console.log(`🔑 Password length: ${process.env.EMAIL_PASS?.length} characters`);
    
    try {
      // Clean the app password (remove any spaces)
      const cleanPassword = process.env.EMAIL_PASS.replace(/\s/g, '');
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
          user: process.env.EMAIL_USER,
          pass: cleanPassword
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false
        }
      });

      // Verify connection
      console.log('🔍 Testing Gmail connection...');
      await this.transporter.verify();
      console.log(`✅ Gmail SMTP ready: ${process.env.EMAIL_USER}`);
      console.log('🎉 Real emails will be sent to actual Gmail addresses!');
    } catch (error) {
      console.log('❌ Gmail SMTP failed:', error.message);
      console.log('');
      console.log('🔧 TROUBLESHOOTING GMAIL SETUP:');
      console.log('1. Go to https://myaccount.google.com/security');
      console.log('2. Enable 2-Step Verification if not already enabled');
      console.log('3. Go to https://myaccount.google.com/apppasswords');
      console.log('4. Generate new App Password for "Mail"');
      console.log('5. Copy the 16-character password (remove spaces)');
      console.log('6. Update EMAIL_PASS in .env file');
      console.log('');
      console.log('Current credentials:');
      console.log(`  EMAIL_USER: ${process.env.EMAIL_USER}`);
      console.log(`  EMAIL_PASS: ${process.env.EMAIL_PASS?.substring(0, 4)}****`);
      console.log('');
      
      throw error;
    }
  }

  async createTestTransporter() {
    console.log('🧪 Configuring test email service...');
    console.log('⚠️  USING TEST EMAILS - Real emails not configured yet!');
    
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

    console.log('📧 Test email credentials:');
    console.log(`User: ${testAccount.user}`);
    console.log(`Pass: ${testAccount.pass}`);
    console.log('');
    console.log('🔧 TO GET REAL EMAILS:');
    console.log('1. Go to https://myaccount.google.com/security');
    console.log('2. Enable 2-Step Verification');
    console.log('3. Generate App Password for "Mail"');
    console.log('4. Update EMAIL_PASS in .env file');
    console.log('');
  }

  async sendOTP(email, otp, userName = 'Friend') {
    await this.initialize();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Bonds App" <noreply@bonds.app>',
      to: email,
      subject: 'Your Bonds Verification Code',
      html: this.generateOTPTemplate(otp, userName, email)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      
      const result = {
        success: true,
        messageId: info.messageId
      };

      // Add preview URL for test emails
      if (!this.hasProductionCredentials()) {
        result.previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('');
        console.log('🎯 YOUR OTP EMAIL IS HERE:');
        console.log('📧 Preview URL:', result.previewUrl);
        console.log('👆 Click this link to see your OTP email!');
        console.log('');
      } else {
        console.log(`📧 ✅ Real OTP email sent to: ${email}`);
        console.log('📱 Check your Gmail inbox for the verification code!');
      }

      return result;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send verification email');
    }
  }

  generateOTPTemplate(otp, userName, email) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bonds - Email Verification</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.6;
                color: #3A3A3A;
                background-color: #FBF9F7;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background: #FFFFFF;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 8px 32px rgba(107, 140, 174, 0.16);
            }
            .header {
                background: linear-gradient(135deg, #6B8CAE 0%, #A67B8C 100%);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }
            .header h1 {
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 8px;
                letter-spacing: -0.02em;
            }
            .header p {
                font-size: 16px;
                opacity: 0.9;
            }
            .content {
                padding: 40px 30px;
                text-align: center;
            }
            .greeting {
                font-size: 20px;
                color: #3A3A3A;
                margin-bottom: 20px;
                font-weight: 500;
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
            .expiry-info {
                font-size: 14px;
                color: #A67B8C;
                margin-top: 20px;
                font-weight: 500;
            }
            .security-note {
                background: rgba(122, 155, 142, 0.08);
                border-left: 4px solid #7A9B8E;
                padding: 20px;
                margin: 30px 0;
                border-radius: 0 12px 12px 0;
                text-align: left;
            }
            .security-note p {
                margin: 0;
                font-size: 14px;
                color: #5A5A5A;
            }
            .footer {
                background: #F9F6F2;
                padding: 30px;
                text-align: center;
                border-top: 1px solid rgba(166, 123, 140, 0.1);
            }
            .footer p {
                margin: 0;
                font-size: 14px;
                color: #8A8A8A;
            }
            .footer .small {
                font-size: 12px;
                margin-top: 10px;
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
                    Please use the verification code below to complete your account setup:
                </div>
                
                <div class="otp-container">
                    <div class="otp-label">Verification Code</div>
                    <div class="otp-code">${otp}</div>
                    <div class="expiry-info">Expires in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes</div>
                </div>
                
                <div class="security-note">
                    <p><strong>🔒 Security Notice:</strong> This code is for ${email}. Never share it with anyone. Bonds will never ask for your verification code via phone or other means.</p>
                </div>
            </div>
            
            <div class="footer">
                <p>Made with love for friendships that last a lifetime</p>
                <p class="small">If you didn't request this code, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  async verifyConnection() {
    try {
      await this.initialize();
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }
}

module.exports = new Mailer();