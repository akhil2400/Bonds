require('dotenv').config();

console.log('🔍 Render Email Diagnosis\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0);
console.log('RESEND_API_KEY starts with re_:', process.env.RESEND_API_KEY?.startsWith('re_') || false);
console.log('CLIENT_URL:', process.env.CLIENT_URL);

if (process.env.RESEND_API_KEY) {
  console.log('API Key preview:', process.env.RESEND_API_KEY.substring(0, 10) + '...');
}

console.log('\n🧪 Testing Resend Integration:');

async function testResendAPI() {
  try {
    const { Resend } = require('resend');
    
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }
    
    if (process.env.RESEND_API_KEY.includes('PLACEHOLDER')) {
      throw new Error('RESEND_API_KEY contains placeholder text');
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Resend client created successfully');
    
    // Test with a simple API call (this will validate the API key)
    try {
      // We'll try to send a test email to validate the API key
      console.log('🔑 Testing API key validity...');
      
      const testResult = await resend.emails.send({
        from: 'BONDS <noreply@resend.dev>', // Use Resend's test domain
        to: 'test@example.com', // This won't actually send
        subject: 'Test Email',
        text: 'This is a test email to validate API key'
      });
      
      console.log('✅ API key is valid! Test result:', testResult);
      
    } catch (apiError) {
      if (apiError.message.includes('API key')) {
        console.error('❌ Invalid API key:', apiError.message);
      } else if (apiError.message.includes('domain')) {
        console.log('⚠️ Domain issue (expected in test):', apiError.message);
        console.log('✅ API key is valid, but domain needs verification');
      } else {
        console.error('❌ API error:', apiError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Resend test failed:', error.message);
  }
}

async function testEmailService() {
  console.log('\n📧 Testing EmailService:');
  
  try {
    const EmailService = require('./services/EmailService');
    
    const isReady = await EmailService.verifyConnection();
    console.log('EmailService ready:', isReady);
    
    if (!isReady) {
      console.log('❌ EmailService initialization failed');
    }
    
  } catch (error) {
    console.error('❌ EmailService test failed:', error.message);
  }
}

async function runDiagnosis() {
  await testResendAPI();
  await testEmailService();
  
  console.log('\n💡 Recommendations:');
  
  if (!process.env.RESEND_API_KEY) {
    console.log('1. Set RESEND_API_KEY in Render environment variables');
  } else if (process.env.RESEND_API_KEY.includes('PLACEHOLDER')) {
    console.log('1. Replace RESEND_API_KEY placeholder with actual API key');
  } else if (!process.env.RESEND_API_KEY.startsWith('re_')) {
    console.log('1. Verify RESEND_API_KEY format (should start with "re_")');
  } else {
    console.log('1. API key looks correct');
  }
  
  console.log('2. Verify domain in Resend dashboard');
  console.log('3. Check Render environment variables match local .env');
  console.log('4. Ensure no trailing spaces in environment variables');
}

runDiagnosis().catch(console.error);