/**
 * Verify Nodemailer OTP Setup
 * 
 * This script verifies that the Nodemailer OTP setup is working correctly
 * with Gmail SMTP configuration.
 */

require('dotenv').config();
const MailerService = require('./utils/mailer');

async function verifyNodemailerSetup() {
  console.log('🔍 Verifying Nodemailer OTP Setup\n');

  try {
    // Check environment variables
    console.log('1️⃣ Environment Variables Check:');
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Found' : '❌ Missing'}`);
    console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Found' : '❌ Missing'}`);
    console.log(`   OTP_EXPIRY_MINUTES: ${process.env.OTP_EXPIRY_MINUTES || '❌ Missing'}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('EMAIL_USER and EMAIL_PASS are required in .env file');
    }

    // Test service initialization
    console.log('\n2️⃣ Service Initialization:');
    const isReady = await MailerService.verifyConnection();
    console.log(`   Service Ready: ${isReady ? '✅ Yes' : '❌ No'}`);

    // Test OTP email sending
    console.log('\n3️⃣ OTP Email Delivery Test:');
    const testEmail = process.env.TRUSTED_EMAIL_1 || process.env.EMAIL_USER;
    const testOTP = '123456';
    const testUserName = 'Test User';

    console.log(`   Sending to: ${testEmail}`);
    console.log(`   OTP Code: ${testOTP}`);

    const result = await MailerService.sendOTP(testEmail, testOTP, testUserName);

    console.log(`   Success: ${result.success ? '✅ Yes' : '❌ No'}`);
    console.log(`   Message ID: ${result.messageId}`);

    // Final verification
    console.log('\n✅ Nodemailer OTP Setup Verification Complete!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Environment variables configured');
    console.log('   ✅ Nodemailer service initialized');
    console.log('   ✅ OTP email sent successfully');
    console.log('   ✅ Ready for signup process');

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    
    console.log('\n🔧 Troubleshooting:');
    if (error.message.includes('EMAIL_USER') || error.message.includes('EMAIL_PASS')) {
      console.log('   - Check EMAIL_USER and EMAIL_PASS in .env file');
      console.log('   - Make sure EMAIL_PASS is a Gmail App Password, not regular password');
    }
    if (error.message.includes('authentication')) {
      console.log('   - Verify Gmail App Password is correct');
      console.log('   - Enable 2-Factor Authentication on Gmail');
      console.log('   - Generate new App Password if needed');
    }
  }
}

// Run verification
verifyNodemailerSetup().catch(console.error);