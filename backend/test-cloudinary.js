// Test Cloudinary configuration
require('dotenv').config();
const { cloudinary } = require('./config/cloudinary');

async function testCloudinary() {
  console.log('🧪 Testing Cloudinary Configuration');
  console.log('==================================');
  
  try {
    // Check if environment variables are set
    console.log('📋 Step 1: Environment Variables');
    console.log(`   CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET'}`);
    console.log(`   CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET'}`);
    console.log(`   CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'}`);
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('');
      console.log('⚠️  CLOUDINARY NOT CONFIGURED');
      console.log('📝 To set up Cloudinary:');
      console.log('1. Create account at https://cloudinary.com/');
      console.log('2. Get your credentials from the dashboard');
      console.log('3. Update backend/.env with your actual credentials');
      console.log('4. See CLOUDINARY_SETUP.md for detailed instructions');
      return;
    }
    
    // Test Cloudinary connection
    console.log('');
    console.log('📊 Step 2: Testing Connection');
    const result = await cloudinary.api.ping();
    
    if (result.status === 'ok') {
      console.log('✅ Cloudinary connection successful!');
      console.log(`   Status: ${result.status}`);
      
      // Get account details
      const usage = await cloudinary.api.usage();
      console.log('');
      console.log('📈 Account Usage:');
      console.log(`   Storage: ${(usage.storage.used_bytes / 1024 / 1024).toFixed(2)} MB used`);
      console.log(`   Bandwidth: ${(usage.bandwidth.used_bytes / 1024 / 1024).toFixed(2)} MB used this month`);
      console.log(`   Transformations: ${usage.transformations.used} used this month`);
    }
    
  } catch (error) {
    console.error('❌ Cloudinary test failed');
    console.error(`   Error: ${error.message || 'Unknown error'}`);
    console.error('   Full error:', error);
    
    if (error.message && error.message.includes('Invalid API key')) {
      console.log('');
      console.log('🔧 INVALID CREDENTIALS:');
      console.log('   → Check your API Key and API Secret');
      console.log('   → Make sure they match your Cloudinary dashboard');
    } else if (error.message && error.message.includes('cloud name')) {
      console.log('');
      console.log('🔧 INVALID CLOUD NAME:');
      console.log('   → Check your Cloud Name in the .env file');
      console.log('   → It should match exactly what\'s in your dashboard');
    }
  }
}

// Run the test
testCloudinary();