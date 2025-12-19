const mongoose = require('mongoose');
const MagicLinkService = require('./services/MagicLinkService');
const AuthService = require('./services/AuthService');
const User = require('./models/User');
require('dotenv').config();

// Test configuration
const TEST_EMAIL = 'magiclink.test@example.com';
const TEST_USER_DATA = {
  name: 'Magic Link Test User',
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

async function cleanupTestUser() {
  try {
    await User.deleteOne({ email: TEST_EMAIL });
    console.log('🧹 Cleaned up test user');
  } catch (error) {
    console.log('⚠️ No test user to cleanup');
  }
}

async function testCompleteSignupFlow() {
  console.log('\n🧪 Testing Complete Signup Flow...');
  
  try {
    // Step 1: Generate Magic Link
    console.log('Step 1: Generating signup magic link...');
    const signupResult = await MagicLinkService.generateAndSendSignupLink(
      TEST_EMAIL,
      TEST_USER_DATA,
      '127.0.0.1',
      'Test-Agent'
    );
    
    console.log('✅ Magic link generated:', {
      success: signupResult.success,
      message: signupResult.message
    });
    
    // Step 2: Simulate getting the token (in real scenario, user clicks email link)
    // For testing, we'll extract the token from the database
    const MagicLinkRepository = require('./repositories/MagicLinkRepository');
    const magicLinks = await MagicLinkRepository.findByEmail(TEST_EMAIL, 10);
    
    if (magicLinks.length === 0) {
      throw new Error('No magic link found in database');
    }
    
    const magicLink = magicLinks[0];
    console.log('✅ Found magic link in database');
    
    // Step 3: Generate a test token that matches the stored hash
    // Since we can't reverse the hash, we'll create a new token for testing
    const testToken = MagicLinkService.generateSecureToken();
    const testTokenHash = await MagicLinkService.hashToken(testToken);
    
    // Update the magic link with our test token hash
    magicLink.tokenHash = testTokenHash;
    await magicLink.save();
    
    console.log('✅ Updated magic link with test token');
    
    // Step 4: Verify Magic Link
    console.log('Step 2: Verifying magic link...');
    const verificationResult = await MagicLinkService.verifyMagicLink(testToken);
    
    console.log('✅ Magic link verified:', {
      success: verificationResult.success,
      email: verificationResult.email,
      type: verificationResult.type
    });
    
    // Step 5: Create user account
    console.log('Step 3: Creating user account...');
    const userResult = await AuthService.registerUser({
      name: verificationResult.userData.name,
      email: verificationResult.email,
      password: verificationResult.userData.password,
      isVerified: true,
      isPasswordHashed: true
    });
    
    console.log('✅ User account created:', {
      success: userResult.success,
      userId: userResult.user._id,
      email: userResult.user.email,
      name: userResult.user.name
    });
    
    return { success: true, user: userResult.user };
    
  } catch (error) {
    console.error('❌ Complete signup flow failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testCompleteLoginFlow() {
  console.log('\n🧪 Testing Complete Login Flow...');
  
  try {
    // Step 1: Generate Login Magic Link
    console.log('Step 1: Generating login magic link...');
    const loginResult = await MagicLinkService.generateAndSendLoginLink(
      TEST_EMAIL,
      '127.0.0.1',
      'Test-Agent'
    );
    
    console.log('✅ Login magic link generated:', {
      success: loginResult.success,
      message: loginResult.message
    });
    
    // Step 2: Get and verify the token (similar to signup flow)
    const MagicLinkRepository = require('./repositories/MagicLinkRepository');
    const magicLinks = await MagicLinkRepository.findByEmail(TEST_EMAIL, 10);
    
    const loginMagicLink = magicLinks.find(link => link.type === 'login');
    if (!loginMagicLink) {
      throw new Error('No login magic link found');
    }
    
    // Create test token for verification
    const testToken = MagicLinkService.generateSecureToken();
    const testTokenHash = await MagicLinkService.hashToken(testToken);
    
    loginMagicLink.tokenHash = testTokenHash;
    await loginMagicLink.save();
    
    console.log('✅ Updated login magic link with test token');
    
    // Step 3: Verify Login Magic Link
    console.log('Step 2: Verifying login magic link...');
    const verificationResult = await MagicLinkService.verifyMagicLink(testToken);
    
    console.log('✅ Login magic link verified:', {
      success: verificationResult.success,
      email: verificationResult.email,
      type: verificationResult.type
    });
    
    // Step 4: Login user
    console.log('Step 3: Logging in user...');
    const loginUserResult = await AuthService.loginUserByEmail(verificationResult.email);
    
    console.log('✅ User logged in:', {
      success: loginUserResult.success,
      userId: loginUserResult.user._id,
      email: loginUserResult.user.email
    });
    
    return { success: true, user: loginUserResult.user };
    
  } catch (error) {
    console.error('❌ Complete login flow failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testCompletePasswordResetFlow() {
  console.log('\n🧪 Testing Complete Password Reset Flow...');
  
  try {
    // Step 1: Generate Password Reset Magic Link
    console.log('Step 1: Generating password reset magic link...');
    const resetResult = await MagicLinkService.generateAndSendPasswordResetLink(
      TEST_EMAIL,
      '127.0.0.1',
      'Test-Agent'
    );
    
    console.log('✅ Password reset magic link generated:', {
      success: resetResult.success,
      message: resetResult.message
    });
    
    // Step 2: Get and verify the token
    const MagicLinkRepository = require('./repositories/MagicLinkRepository');
    const magicLinks = await MagicLinkRepository.findByEmail(TEST_EMAIL, 10);
    
    const resetMagicLink = magicLinks.find(link => link.type === 'password_reset');
    if (!resetMagicLink) {
      throw new Error('No password reset magic link found');
    }
    
    // Create test token for verification
    const testToken = MagicLinkService.generateSecureToken();
    const testTokenHash = await MagicLinkService.hashToken(testToken);
    
    resetMagicLink.tokenHash = testTokenHash;
    await resetMagicLink.save();
    
    console.log('✅ Updated password reset magic link with test token');
    
    // Step 3: Verify Password Reset Magic Link
    console.log('Step 2: Verifying password reset magic link...');
    const verificationResult = await MagicLinkService.verifyMagicLink(testToken);
    
    console.log('✅ Password reset magic link verified:', {
      success: verificationResult.success,
      email: verificationResult.email,
      type: verificationResult.type
    });
    
    // Step 4: Reset password
    console.log('Step 3: Resetting password...');
    const newPassword = 'newpassword123';
    await AuthService.resetUserPassword(verificationResult.email, newPassword);
    
    console.log('✅ Password reset successfully');
    
    // Step 5: Test login with new password
    console.log('Step 4: Testing login with new password...');
    const loginResult = await AuthService.loginUser(TEST_EMAIL, newPassword);
    
    console.log('✅ Login with new password successful:', {
      success: loginResult.success,
      userId: loginResult.user._id
    });
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Complete password reset flow failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function runCompleteFlowTests() {
  console.log('🚀 Starting Complete Magic Link Flow Tests...\n');
  
  try {
    await connectDB();
    await cleanupTestUser();
    
    // Test complete flows
    const signupResult = await testCompleteSignupFlow();
    if (!signupResult.success) {
      throw new Error('Signup flow failed: ' + signupResult.error);
    }
    
    const loginResult = await testCompleteLoginFlow();
    if (!loginResult.success) {
      throw new Error('Login flow failed: ' + loginResult.error);
    }
    
    const resetResult = await testCompletePasswordResetFlow();
    if (!resetResult.success) {
      throw new Error('Password reset flow failed: ' + resetResult.error);
    }
    
    console.log('\n✅ All complete flow tests passed!');
    console.log('🎉 Magic Link system is working correctly!');
    
  } catch (error) {
    console.error('\n❌ Complete flow test suite failed:', error.message);
  } finally {
    await cleanupTestUser();
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runCompleteFlowTests();
}

module.exports = {
  runCompleteFlowTests,
  testCompleteSignupFlow,
  testCompleteLoginFlow,
  testCompletePasswordResetFlow
};