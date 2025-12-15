const mongoose = require('mongoose');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testing MongoDB Atlas connection...');
  console.log(`📍 Connection URI: ${process.env.MONGO_URI?.replace(/:[^:@]*@/, ':****@')}`);
  
  try {
    // Test connection with timeout
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 10000, // 10 second timeout
    });

    console.log('✅ MongoDB Atlas connection successful!');
    console.log(`📍 Connected to: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    
    // Test a simple operation
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`📊 Collections found: ${collections.length}`);
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('IP')) {
      console.log('');
      console.log('🔧 IP WHITELIST ISSUE DETECTED:');
      console.log('1. Go to https://cloud.mongodb.com/');
      console.log('2. Select your project and cluster');
      console.log('3. Go to "Network Access" in the left sidebar');
      console.log('4. Click "Add IP Address"');
      console.log('5. Either:');
      console.log('   - Add your current IP address');
      console.log('   - Or add 0.0.0.0/0 for development (allows all IPs)');
      console.log('6. Wait 2-3 minutes for changes to take effect');
    } else if (error.message.includes('authentication')) {
      console.log('');
      console.log('🔧 AUTHENTICATION ISSUE DETECTED:');
      console.log('1. Check your username and password in the connection string');
      console.log('2. Make sure the database user exists in MongoDB Atlas');
      console.log('3. Verify the user has proper permissions');
    } else {
      console.log('');
      console.log('🔧 GENERAL CONNECTION ISSUE:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the cluster is running in MongoDB Atlas');
      console.log('3. Check if there are any Atlas service issues');
    }
    
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection();
}

module.exports = testDatabaseConnection;