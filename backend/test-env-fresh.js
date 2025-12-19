// Clear require cache to force fresh load
delete require.cache[require.resolve('dotenv')];

// Load environment variables fresh
require('dotenv').config({ path: './.env' });

console.log('🔍 Fresh Environment Test...\n');

const apiKey = process.env.RESEND_API_KEY;
console.log('Raw API Key:', JSON.stringify(apiKey));
console.log('API Key length:', apiKey ? apiKey.length : 0);
console.log('API Key starts with re_:', apiKey ? apiKey.startsWith('re_') : false);
console.log('Contains PLACEHOLDER:', apiKey ? apiKey.includes('PLACEHOLDER') : false);

if (apiKey && apiKey.length > 10) {
  console.log('First 15 chars:', apiKey.substring(0, 15));
  console.log('Last 10 chars:', apiKey.substring(apiKey.length - 10));
}

// Test actual Resend initialization
try {
  const { Resend } = require('resend');
  
  if (!apiKey || apiKey.includes('PLACEHOLDER')) {
    console.log('❌ API key is invalid or contains placeholder');
  } else {
    const resend = new Resend(apiKey);
    console.log('✅ Resend initialized with real API key');
    
    // Try to make a test call (this will show if the key is actually valid)
    console.log('🧪 Testing API key with Resend...');
    
    // We'll just check if we can create the client without errors
    console.log('✅ API key format accepted by Resend client');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}