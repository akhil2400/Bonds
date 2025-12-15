const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('🔧 MONGODB ATLAS TROUBLESHOOTING:');
    console.log('1. Check if your IP address is whitelisted in MongoDB Atlas');
    console.log('2. Go to Network Access in your Atlas dashboard');
    console.log('3. Add your current IP address or use 0.0.0.0/0 for development');
    console.log('4. Verify your connection string in .env file');
    console.log('');
    console.log('⚠️  Server will continue without database connection for development');
    return false;
  }
};

module.exports = connectDB;