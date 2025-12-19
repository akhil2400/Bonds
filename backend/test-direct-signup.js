require('dotenv').config();
const mongoose = require('mongoose');
const AuthService = require('./services/AuthService');

async function testDirectSignup() {
  console.log('🧪 Testing Direct Signup Flow\n');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test user data
    const testUser = {
      name: 'Direct Signup Test',
      email: 'directsignup@test.com',
      password: 'testpassword123'
    };
    
    // Clean up any existing test user
    try {
      await AuthService.deleteUserByEmail(testUser.email);
      console.log('🧹 Cleaned up existing test user');
    } catch (error) {
      // User doesn't exist, that's fine
    }
    
    console.log('\n📝 Testing Direct Signup...');
    
    // Test direct signup
    const result = await AuthService.registerUser({
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      isVerified: true // Direct signup sets this to true
    });
    
    console.log('✅ Direct signup successful!');
    console.log('👤 User created:', {
      id: result.user._id,
      name: result.user.name,
      email: result.user.email,
      isVerified: result.user.isVerified
    });
    
    console.log('\n🔐 Testing Login...');
    
    // Test login with created account
    const loginResult = await AuthService.loginUser(testUser.email, testUser.password);
    
    console.log('✅ Login successful!');
    console.log('🎫 JWT token generated:', !!loginResult.accessToken);
    console.log('👤 User data:', {
      id: loginResult.user._id,
      name: loginResult.user.name,
      email: loginResult.user.email
    });
    
    // Clean up test user
    await AuthService.deleteUserByEmail(testUser.email);
    console.log('\n🧹 Test user cleaned up');
    
    console.log('\n🎉 Direct Signup Flow Test: PASSED');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

testDirectSignup();