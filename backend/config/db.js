const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Validate environment variables
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is not defined in environment variables');
      console.error('💡 Check your .env file and ensure dotenv.config() is called');
      process.exit(1);
    }

    console.log('🔍 Connecting to MongoDB Atlas...');
    console.log(`📍 URI defined: ${process.env.MONGO_URI ? 'YES' : 'NO'}`);
    console.log(`📍 URI format: ${process.env.MONGO_URI.startsWith('mongodb+srv://') ? 'Atlas SRV' : 'Standard'}`);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log('✅ MongoDB connected successfully');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed');
    console.error(`📋 Error: ${error.message}`);
    
    // Specific error handling
    if (error.message.includes('IP')) {
      console.error('🔧 IP WHITELIST ISSUE:');
      console.error('   → Your IP address is not whitelisted in MongoDB Atlas');
      console.error('   → Go to Network Access in Atlas dashboard');
      console.error('   → Add your current IP or use 0.0.0.0/0 for development');
    } else if (error.message.includes('authentication')) {
      console.error('🔧 AUTHENTICATION ISSUE:');
      console.error('   → Check username and password in connection string');
      console.error('   → Verify database user exists and has proper permissions');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.error('🔧 NETWORK ISSUE:');
      console.error('   → Check internet connection');
      console.error('   → Verify cluster is running in Atlas');
    } else {
      console.error('🔧 GENERAL ISSUE:');
      console.error('   → Check connection string format');
      console.error('   → Verify cluster status in Atlas dashboard');
    }
    
    console.error('');
    console.error('🚨 Database connection is required for application to function');
    process.exit(1);
  }
};

module.exports = connectDB;