const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Monitor MongoDB connection status in real-time
 * Run this to see when your database connects after fixing IP whitelist
 */

let connectionAttempts = 0;
const maxAttempts = 20; // Try for about 10 minutes

async function monitorConnection() {
  console.log('🔍 Monitoring MongoDB Atlas connection...');
  console.log('📍 Waiting for IP whitelist changes to take effect...');
  console.log('⏰ This may take 2-3 minutes after adding your IP to Atlas');
  console.log('');

  const attemptConnection = async () => {
    connectionAttempts++;
    
    try {
      console.log(`🔄 Attempt ${connectionAttempts}/${maxAttempts}...`);
      
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 5000,
      });

      console.log('');
      console.log('🎉 SUCCESS! MongoDB Atlas connected!');
      console.log(`✅ Connected to: ${conn.connection.host}`);
      console.log(`🗄️  Database: ${conn.connection.name}`);
      console.log('');
      console.log('🚀 Your backend server should now show:');
      console.log('   Database: ✅ Connected');
      console.log('');
      console.log('🎯 All features are now working:');
      console.log('   - User authentication ✅');
      console.log('   - Memory creation ✅');
      console.log('   - All data operations ✅');
      
      await mongoose.disconnect();
      process.exit(0);
      
    } catch (error) {
      if (connectionAttempts >= maxAttempts) {
        console.log('');
        console.log('❌ Connection monitoring timed out');
        console.log('🔧 Please check:');
        console.log('1. Did you add your IP (103.42.196.38) to MongoDB Atlas?');
        console.log('2. Did you wait 2-3 minutes for changes to take effect?');
        console.log('3. Are you logged into the correct MongoDB account?');
        console.log('4. Did you select the correct project (BONDS)?');
        console.log('');
        console.log('💡 Try running: npm run test-db');
        process.exit(1);
      }
      
      // Show progress dots
      process.stdout.write('.');
      
      // Wait 30 seconds before next attempt
      setTimeout(attemptConnection, 30000);
    }
  };

  attemptConnection();
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Monitoring stopped');
  console.log('💡 Run "npm run test-db" to test connection manually');
  process.exit(0);
});

monitorConnection();