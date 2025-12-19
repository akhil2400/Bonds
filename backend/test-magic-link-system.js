const mongoose = require('mongoose');
const MagicLinkService = require('./services/MagicLinkService');
const EmailService = require('./services/EmailService');
const AuthService = require('./services/AuthService');
require('dotenv').config();

// Test configuration
const TEST_EMAIL = 'test@example.com';
const TEST_USER_DATA = {
  name: 'Test User',
  password: 'testpassword123'
};

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function testEmailService() {
  console.log('\n🧪 Testing Email Service...');
  
  try {
    const isConnected = await EmailService.verifyConnection();
    if (isConnected) {
      console.log('✅ Email service connection verified');
    } else {
      console.log('❌ Email service connection failed');
    }
  } catch (error) {
    console.error('❌ Email service test failed:', error.message);
  }
}

async function testMagicLinkGeneration() {
  console.log('\n🧪 Testing Magic Link Generation...');
  
  try {
    // Test signup magic link
    const signupResult = await MagicLinkService.generateAndSendSignupLink(
      TEST_EMAIL,
      TEST_USER_DATA,
      '127.0.0.1',
      'Test-Agent'
    );
    
    console.log('✅ Signup magic link generated:', {
      success: signupResult.success,
      message: signupResult.message,
      expiresAt: signupResult.expiresAt
    });
    
    return signupResult;
  } catch (error) {
    console.error('❌ Magic link generation failed:', error.message);
    return null;
  }
}

async function testTokenVerification() {
  console.log('\n🧪 Testing Token Verification...');
  
  try {
    // Generate a test token
    const token = MagicLinkService.generateSecureToken();
    console.log('Generated test token:', token.substring(0, 10) + '...');
    
    // Test token hashing
    const hashedToken = await MagicLinkService.hashToken(token);
    console.log('✅ Token hashed successfully');
    
    // Test token verification
    const isValid = await MagicLinkService.verifyTokenHash(token, hashedToken);
    console.log('✅ Token verification:', isValid ? 'PASSED' : 'FAILED');
    
    return { token, hashedToken };
  } catch (error) {
    console.error('❌ Token verification test failed:', error.message);
    return null;
  }
}

async function testRateLimiting() {
  console.log('\n🧪 Testing Rate Limiting...');
  
  try {
    // Test rate limiting by making multiple requests
    const testEmail = 'ratelimit@test.com';
    
    for (let i = 1; i <= 4; i++) {
      try {
        await MagicLinkService.generateAndSendSignupLink(
          testEmail,
          TEST_USER_DATA,
          '127.0.0.1',
          'Test-Agent'
        );
        console.log(`✅ Request ${i}: Success`);
      } catch (error) {
        if (error.statusCode === 429) {
          console.log(`⚠️ Request ${i}: Rate limited (expected)`);
        } else {
          console.log(`❌ Request ${i}: Unexpected error:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Rate limiting test failed:', error.message);
  }
}

async function testMagicLinkStats() {
  console.log('\n🧪 Testing Magic Link Statistics...');
  
  try {
    const stats = await MagicLinkService.getMagicLinkStats();
    console.log('✅ Magic Link Stats:', stats);
  } catch (error) {
    console.error('❌ Stats test failed:', error.message);
  }
}

async function testCleanup() {
  console.log('\n🧪 Testing Cleanup...');
  
  try {
    const deletedCount = await MagicLinkService.cleanExpiredLinks();
    console.log('✅ Cleanup completed. Deleted expired links:', deletedCount);
  } catch (error) {
    console.error('❌ Cleanup test failed:', error.message);
  }
}

async function testAuthServiceIntegration() {
  console.log('\n🧪 Testing Auth Service Integration...');
  
  try {
    // Test user existence check
    const userExists = await AuthService.checkUserExists(TEST_EMAIL);
    console.log('✅ User existence check:', userExists ? 'User exists' : 'User does not exist');
    
    // If user doesn't exist, we can test the full flow
    if (!userExists) {
      console.log('✅ Ready for full signup flow test');
    } else {
      console.log('⚠️ Test user already exists, cleanup may be needed');
    }
  } catch (error) {
    console.error('❌ Auth service integration test failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Magic Link System Tests...\n');
  
  try {
    await connectDB();
    
    await testEmailService();
    await testTokenVerification();
    await testMagicLinkGeneration();
    await testRateLimiting();
    await testMagicLinkStats();
    await testAuthServiceIntegration();
    await testCleanup();
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testEmailService,
  testMagicLinkGeneration,
  testTokenVerification,
  testRateLimiting,
  testMagicLinkStats,
  testCleanup,
  testAuthServiceIntegration
};