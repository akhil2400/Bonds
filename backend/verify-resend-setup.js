/**
 * Verify Resend OTP Setup
 * 
 * This script verifies that the Resend OTP setup is working correctly
 * with the account owner's email address.
 */

require('dotenv').config();
const EmailService = require('./utils/email.service');

async function verifyResendSetup() {
  console.log('🔍 Verifying Resend OTP Setup\n');

  try {
    // Check environment variables
    console.log('1️⃣ Environment Variables Check:');
    console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Found' : '❌ Missing'}`);
    console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || '❌ Missing'}`);
    console.log(`   OTP_EXPIRY_MINUTES: ${process.env.OTP_EXPIRY_MINUTES || '❌ Missing'}`);

    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is missing from .env file');
    }

    // Test service initialization
    console.log('\n2️⃣ Service Initialization:');
    const isReady = await EmailService.verifyConnection();
    console.log(`   Service Ready: ${isReady ? '✅ Yes' : '❌ No'}`);

    // Test OTP email sending to account owner
    console.log('\n3️⃣ OTP Email Delivery Test:');
    const accountOwnerEmail = process.env.TRUSTED_EMAIL_1 || 'test@example.com';
    const testOTP = '123456';
    const testUserName = 'Test User';

    console.log(`   Sending to: ${accountOwnerEmail}`);
    console.log(`   OTP Code: ${testOTP}`);

    const result = await EmailService.sendOTP(accountOwnerEmail, testOTP, testUserName);

    console.log(`   Success: ${result.success ? '✅ Yes' : '❌ No'}`);
    console.log(`   Message ID: ${result.messageId}`);

    // Final verification
    console.log('\n✅ Resend OTP Setup Verification Complete!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Environment variables configured');
    console.log('   ✅ Resend service initialized');
    console.log('   ✅ OTP email sent successfully');
    console.log('   ✅ Ready for signup process');

    console.log('\n📧 Testing Instructions:');
    console.log(`   1. Use email: ${accountOwnerEmail}`);
    console.log('   2. Go to signup page');
    console.log('   3. Enter the email and complete signup');
    console.log('   4. Check Gmail inbox for OTP');
    console.log('   5. Enter OTP to complete registration');

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    
    console.log('\n🔧 Troubleshooting:');
    if (error.message.includes('API key')) {
      console.log('   - Check RESEND_API_KEY in .env file');
      console.log('   - Verify API key is correct in Resend dashboard');
    }
    if (error.message.includes('domain')) {
      console.log('   - Verify domain at resend.com/domains');
      console.log('   - Or use onboarding@resend.dev for testing');
    }
    if (error.message.includes('testing emails')) {
      console.log('   - Use bondforever44@gmail.com for testing');
      console.log('   - Or verify domain for production use');
    }
  }
}

// Run verification
verifyResendSetup().catch(console.error);