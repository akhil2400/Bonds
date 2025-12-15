// Load environment variables FIRST
require('dotenv').config();

// Validate critical environment variables
if (!process.env.PORT) {
  console.error('❌ PORT is not defined in environment variables');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in environment variables');
  console.error('💡 Check your .env file exists and contains MONGO_URI');
  process.exit(1);
}

const app = require('./app');
const connectDB = require('./config/db');
const EmailService = require('./utils/email.service');
const OTPService = require('./services/OTPService');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🚀 Starting server...');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📍 Port: ${PORT}`);
    
    // Step 1: Connect to MongoDB Atlas (REQUIRED)
    console.log('');
    console.log('📊 Step 1: Database Connection');
    const dbConnection = await connectDB();
    
    // Step 2: Start Express server (only after DB connection succeeds)
    console.log('');
    console.log('🌐 Step 2: Starting Express Server');
    app.listen(PORT, () => {
      console.log('✅ Express server started successfully');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📍 Database: ✅ Connected`);
      console.log('');
      console.log('🎉 Application is ready to accept requests!');
    });

    // Step 3: Initialize additional services
    console.log('');
    console.log('📧 Step 3: Email Service Initialization');
    try {
      await EmailService.verifyConnection();
      console.log('✅ Resend email service ready');
    } catch (error) {
      console.log('⚠️  Email service will be initialized on first use');
      console.log('💡 Make sure RESEND_API_KEY is configured in .env');
    }

    // Step 4: Schedule background tasks
    console.log('');
    console.log('⏰ Step 4: Background Tasks');
    setInterval(async () => {
      try {
        await OTPService.cleanExpiredOTPs();
      } catch (error) {
        console.error('⚠️  OTP cleanup failed:', error.message);
      }
    }, 60 * 60 * 1000); // Every hour
    
    console.log('✅ Background tasks scheduled');
    
  } catch (error) {
    console.error('');
    console.error('🚨 FATAL ERROR: Failed to start server');
    console.error(`📋 Reason: ${error.message}`);
    console.error('');
    console.error('💡 Common solutions:');
    console.error('   → Check MongoDB Atlas connection');
    console.error('   → Verify environment variables in .env');
    console.error('   → Ensure IP is whitelisted in Atlas');
    console.error('');
    process.exit(1);
  }
};

startServer();