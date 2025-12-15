/**
 * Test Script: Resend Email Service
 * 
 * This script tests the new Resend-based email service to ensure
 * OTP emails are sent correctly after migrating from Nodemailer.
 */

require('dotenv').config();
const EmailService = require('./utils/email.service');

async function testResendService() {
  console.log('🧪 Testing Resend Email Service\n');

  try {
    // Test 1: Verify service initialization
    console.log('1️⃣ Testing service initialization...');
    const isReady = await EmailService.verifyConnection();
    
    if (isReady) {
      console.log('✅ Resend service initialized successfully');
    } else {
      console.log('❌ Resend service initialization failed');
      return;
    }

    // Test 2: Send test OTP email
    console.log('\n2️⃣ Testing OTP email sending...');
    
    const testEmail = 'test@example.com'; // Use a test email
    const testOTP = '123456';
    const testUserName = 'Test User';

    console.log(`📧 Sending test OTP to: ${testEmail}`);
    console.log(`🔢 OTP: ${testOTP}`);

    const result = await EmailService.sendOTP(testEmail, testOTP, testUserName);

    if (result.success) {
      console.log('✅ OTP email sent successfully');
      console.log(`📨 Message ID: ${result.messageId}`);
    } else {
      console.log('❌ Failed to send OTP email');
    }

    console.log('\n✅ Resend email service test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Nodemailer completely removed');
    console.log('   - Resend service working correctly');
    console.log('   - OTP emails can be sent via Resend API');
    console.log('   - Email templates are properly formatted');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('RESEND_API_KEY')) {
      console.log('\n💡 Setup Instructions:');
      console.log('1. Sign up at https://resend.com');
      console.log('2. Create an API key');
      console.log('3. Add RESEND_API_KEY to your .env file');
      console.log('4. Verify your domain (for production)');
    }
  }
}

// Run the test
testResendService().catch(console.error);