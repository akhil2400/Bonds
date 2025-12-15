const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Setup script for local MongoDB development
 * Use this if MongoDB Atlas is not accessible
 */

async function setupLocalMongoDB() {
  console.log('🔧 Setting up local MongoDB for development...');
  
  // Local MongoDB connection string
  const localMongoURI = 'mongodb://localhost:27017/BONDS_DEV';
  
  try {
    console.log('📍 Attempting to connect to local MongoDB...');
    
    const conn = await mongoose.connect(localMongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000,
    });

    console.log('✅ Local MongoDB connection successful!');
    console.log(`📍 Connected to: ${conn.connection.host}:${conn.connection.port}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    
    // Create a test collection
    const testCollection = conn.connection.db.collection('test');
    await testCollection.insertOne({ message: 'Local MongoDB is working!', timestamp: new Date() });
    
    console.log('✅ Local MongoDB setup completed successfully');
    console.log('');
    console.log('🔧 TO USE LOCAL MONGODB:');
    console.log('1. Update your .env file:');
    console.log(`   MONGO_URI=${localMongoURI}`);
    console.log('2. Restart your backend server');
    console.log('3. All features will work with local database');
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Local MongoDB connection failed:');
    console.error(`   Error: ${error.message}`);
    console.log('');
    console.log('🔧 LOCAL MONGODB NOT AVAILABLE:');
    console.log('1. Install MongoDB locally:');
    console.log('   - Download from: https://www.mongodb.com/try/download/community');
    console.log('   - Or use Docker: docker run -d -p 27017:27017 mongo');
    console.log('2. Or fix MongoDB Atlas connection (recommended)');
    console.log('');
    console.log('🌐 MONGODB ATLAS SETUP (RECOMMENDED):');
    console.log(`1. Your current IP: 103.42.196.38`);
    console.log('2. Go to https://cloud.mongodb.com/');
    console.log('3. Network Access → Add IP Address → Add 103.42.196.38');
    console.log('4. Or add 0.0.0.0/0 for development (allows all IPs)');
    
    process.exit(1);
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupLocalMongoDB();
}

module.exports = setupLocalMongoDB;