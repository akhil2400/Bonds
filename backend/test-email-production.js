// Production Email Test - Comprehensive Diagnostics
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailProduction() {
  console.log('🔍 PRODUCTION EMAIL DIAGNOSTIC TEST');
  console.log('=====================================');
  
  // Step 1: Check environment variables
  console.log('\n📋 Step 1: Environment Variables');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
  console.log('EMAIL_USER value:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS format:', process.env.EMAIL_PASS ? `${process.env.EMAIL_PASS.length} characters` : 'Not set');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials not configured');
    return;
  }
  
  // Step 2: Test different SMTP configurations
  const configs = [
    {
      name: 'Gmail Service (Current)',
      config: {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      }
    },
    {
      name: 'Gmail SMTP Direct',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      }
    },
    {
      name: 'Gmail SMTP SSL',
      config: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      }
    }
  ];
  
  for (const { name, config } of configs) {
    console.log(`\n📧 Step 2: Testing ${name}`);
    console.log('----------------------------------------');
    
    try {
      const transporter = nodemailer.createTransport(config);
      
      // Test connection
      console.log('🔍 Testing connection...');
      await transporter.verify();
      console.log('✅ Connection successful');
      
      // Test sending email
      console.log('📤 Sending test email...');
      const testEmail = {
        from: {
          name: 'BONDS Test',
          address: process.env.EMAIL_USER
        },
        to: process.env.EMAIL_USER, // Send to self for testing
        subject: 'BONDS Production Email Test',
        text: `Test email sent at ${new Date().toISOString()}`,
        html: `
          <h2>BONDS Email Test</h2>
          <p>This is a test email from the BONDS production server.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
          <p>Configuration: ${name}</p>
        `
      };
      
      const result = await transporter.sendMail(testEmail);
      console.log('✅ Email sent successfully');
      console.log('📧 Message ID:', result.messageId);
      console.log('📧 Response:', result.response);
      
      // This configuration works, use it
      console.log(`🎉 SUCCESS: ${name} is working!`);
      break;
      
    } catch (error) {
      console.log('❌ Failed:', error.message);
      if (error.code) {
        console.log('📋 Error code:', error.code);
      }
      if (error.command) {
        console.log('📋 Failed command:', error.command);
      }
    }
  }
  
  console.log('\n🔍 TROUBLESHOOTING TIPS:');
  console.log('1. Check Gmail App Password is correct (16 characters)');
  console.log('2. Ensure 2FA is enabled on Gmail account');
  console.log('3. Verify "Less secure app access" is disabled (use App Password)');
  console.log('4. Check if Gmail account is locked or suspended');
  console.log('5. Try generating a new App Password');
  
  console.log('\n📧 App Password Format Should Be:');
  console.log('   - 16 characters total');
  console.log('   - 4 groups of 4 characters');
  console.log('   - Example: abcd efgh ijkl mnop');
  console.log('   - Current format:', process.env.EMAIL_PASS);
}

// Run the test
testEmailProduction().catch(console.error);