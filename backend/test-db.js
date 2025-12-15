// Isolation test script for MongoDB Atlas connection
require('dotenv').config();

const mongoose = require('mongoose');

async function testDatabaseConnection() {
  console.log('🧪 MongoDB Atlas Connection Test');
  console.log('================================');
  
  // Step 1: Validate environment
  console.log('');
  console.log('📋 Step 1: Environment Validation');
  console.log(`   dotenv loaded: ${process.env.NODE_ENV ? 'YES' : 'UNKNOWN'}`);
  console.log(`   MONGO_URI defined: ${process.env.MONGO_URI ? 'YES' : 'NO'}`);
  
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI not found in environment variables');
    console.error('💡 Ensure .env file exists with MONGO_URI');
    process.exit(1);
  }
  
  console.log(`   URI format: ${process.env.MONGO_URI.startsWith('mongodb+srv://') ? 'Atlas SRV ✅' : 'Non-Atlas ⚠️'}`);
  console.log(`   URI length: ${process.env.MONGO_URI.length} characters`);
  
  // Step 2: Connection attempt
  console.log('');
  console.log('📊 Step 2: Connection Test');
  console.log('   Attempting connection...');
  
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log('✅ Connection successful!');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Ready state: ${conn.connection.readyState}`);
    
    // Step 3: Basic operation test
    console.log('');
    console.log('🔍 Step 3: Database Operations Test');
    
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`   Collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('   Collection names:');
      collections.forEach(col => console.log(`     - ${col.name}`));
    }
    
    // Step 4: Cleanup
    console.log('');
    console.log('🧹 Step 4: Cleanup');
    await mongoose.disconnect();
    console.log('   Connection closed');
    
    console.log('');
    console.log('🎉 TEST PASSED: MongoDB Atlas connection is working!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Connection failed');
    console.error(`   Error: ${error.message}`);
    console.error('');
    
    // Detailed error analysis
    console.error('🔧 Error Analysis:');
    
    if (error.message.includes('IP')) {
      console.error('   Issue: IP WHITELIST');
      console.error('   Solution:');
      console.error('     1. Go to https://cloud.mongodb.com/');
      console.error('     2. Navigate to Network Access');
      console.error('     3. Add your current IP address');
      console.error('     4. Or add 0.0.0.0/0 for development');
      console.error('     5. Wait 2-3 minutes for changes');
    } else if (error.message.includes('authentication')) {
      console.error('   Issue: AUTHENTICATION');
      console.error('   Solution:');
      console.error('     1. Check username/password in connection string');
      console.error('     2. Verify database user exists in Atlas');
      console.error('     3. Ensure user has proper permissions');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('   Issue: DNS/NETWORK');
      console.error('   Solution:');
      console.error('     1. Check internet connection');
      console.error('     2. Verify cluster hostname in connection string');
      console.error('     3. Try from different network');
    } else if (error.message.includes('timeout')) {
      console.error('   Issue: CONNECTION TIMEOUT');
      console.error('   Solution:');
      console.error('     1. Check network stability');
      console.error('     2. Verify cluster is running');
      console.error('     3. Try increasing timeout values');
    } else {
      console.error('   Issue: UNKNOWN');
      console.error('   Solution:');
      console.error('     1. Check connection string format');
      console.error('     2. Verify cluster status in Atlas');
      console.error('     3. Check Atlas service status');
    }
    
    console.error('');
    console.error('🚨 TEST FAILED: Fix the above issue and retry');
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();