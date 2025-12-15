const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔍 Attempting MongoDB connection...');
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 10000, // 10 second timeout
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('');
    console.log('🔧 MONGODB ATLAS TROUBLESHOOTING:');
    console.log('📍 Your current IP address needs to be whitelisted');
    console.log('');
    console.log('🚀 QUICK FIX:');
    console.log('1. Go to https://cloud.mongodb.com/');
    console.log('2. Select your BONDS project');
    console.log('3. Go to "Network Access" → "Add IP Address"');
    console.log('4. Add your IP: 103.42.196.38');
    console.log('5. Or click "Allow Access from Anywhere" for development');
    console.log('6. Wait 2-3 minutes for changes to take effect');
    console.log('');
    console.log('🧪 Test connection: npm run test-db');
    console.log('📖 Full guide: See MONGODB_ATLAS_FIX.md');
    console.log('');
    console.log('⚠️  Server will continue without database connection');
    return false;
  }
};

module.exports = connectDB;