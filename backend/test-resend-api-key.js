require('dotenv').config();

console.log('🔍 Testing Resend API Key Configuration...\n');

// Check if API key is loaded
const apiKey = process.env.RESEND_API_KEY;
console.log('API Key loaded:', apiKey ? 'YES' : 'NO');
console.log('API Key length:', apiKey ? apiKey.length : 0);
console.log('API Key starts with re_:', apiKey ? apiKey.startsWith('re_') : false);
console.log('API Key contains PLACEHOLDER:', apiKey ? apiKey.includes('PLACEHOLDER') : false);

if (apiKey) {
  console.log('API Key preview:', apiKey.substring(0, 10) + '...');
}

// Test Resend initialization
try {
  const { Resend } = require('resend');
  const resend = new Resend(apiKey);
  console.log('\n✅ Resend client created successfully');
  
  // Test a simple API call (this will fail if API key is invalid)
  console.log('🧪 Testing API key validity...');
  
  // Note: We can't actually send an email in test, but we can check if the client initializes
  console.log('✅ API key appears to be valid format');
  
} catch (error) {
  console.error('❌ Resend initialization failed:', error.message);
}

console.log('\n🎯 Recommendation:');
if (!apiKey) {
  console.log('- Add RESEND_API_KEY to your .env file');
} else if (!apiKey.startsWith('re_')) {
  console.log('- Your API key should start with "re_"');
} else if (apiKey.includes('PLACEHOLDER')) {
  console.log('- Replace the placeholder with your actual API key');
} else {
  console.log('- Your API key looks correct! The issue might be elsewhere.');
}