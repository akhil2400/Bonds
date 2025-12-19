const fs = require('fs');
const path = require('path');

console.log('🔍 Direct File Reading Test...\n');

// Read .env file directly
const envPath = path.join(__dirname, '.env');
console.log('Reading from:', envPath);

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('File exists:', true);
  console.log('File size:', envContent.length, 'bytes');
  
  // Find RESEND_API_KEY line
  const lines = envContent.split('\n');
  const resendLine = lines.find(line => line.startsWith('RESEND_API_KEY='));
  
  if (resendLine) {
    console.log('Found RESEND_API_KEY line:', resendLine);
    const apiKey = resendLine.split('=')[1];
    console.log('Extracted API key:', apiKey);
    console.log('Contains PLACEHOLDER:', apiKey.includes('PLACEHOLDER'));
  } else {
    console.log('❌ RESEND_API_KEY line not found');
  }
  
  // Show first few lines of file
  console.log('\nFirst 10 lines of .env file:');
  lines.slice(0, 10).forEach((line, i) => {
    console.log(`${i + 1}: ${line}`);
  });
  
} catch (error) {
  console.error('❌ Error reading .env file:', error.message);
}

// Also test with dotenv
console.log('\n🔍 Testing with dotenv...');
delete require.cache[require.resolve('dotenv')];
const dotenv = require('dotenv');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Dotenv error:', result.error);
} else {
  console.log('✅ Dotenv loaded successfully');
  console.log('RESEND_API_KEY from dotenv:', result.parsed?.RESEND_API_KEY || 'NOT FOUND');
}