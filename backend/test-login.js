// Test login functionality
require('dotenv').config();
const axios = require('axios');

async function testLogin() {
  console.log('🧪 Testing Login Functionality');
  console.log('==============================');
  
  const baseURL = 'http://192.168.18.210:5000/api';
  
  try {
    // Test with existing user credentials
    const loginData = {
      email: 'naadithya36@gmail.com', // User that just signed up
      password: 'test123' // Assuming this was the password used
    };
    
    console.log('📋 Step 1: Testing Login API');
    console.log(`   Email: ${loginData.email}`);
    
    const response = await axios.post(`${baseURL}/auth/login`, loginData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log(`   User: ${response.data.user.name}`);
    console.log(`   Email: ${response.data.user.email}`);
    console.log(`   Role: ${response.data.user.role}`);
    console.log(`   Trusted: ${response.data.user.isTrustedMember}`);
    
    // Check if cookies were set
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      console.log('🍪 Cookies set:');
      cookies.forEach(cookie => {
        const cookieName = cookie.split('=')[0];
        console.log(`   - ${cookieName}`);
      });
    } else {
      console.log('⚠️  No cookies were set');
    }
    
  } catch (error) {
    console.error('❌ Login failed');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${error.response.data.error}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

// Run the test
testLogin();