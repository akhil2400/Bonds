require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');
const Mailer = require('./utils/mailer');
const OTPService = require('./services/OTPService');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Try to connect to MongoDB (non-blocking for development)
    const dbConnected = await connectDB();
    
    // Start server regardless of database connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Database: ${dbConnected ? '✅ Connected' : '❌ Disconnected'}`);
      console.log(`OTP Expiry: ${process.env.OTP_EXPIRY_MINUTES || 5} minutes`);
      
      if (!dbConnected) {
        console.log('');
        console.log('🚨 IMPORTANT: Database not connected!');
        console.log('📝 Authentication and data features will not work');
        console.log('🔧 Please fix MongoDB Atlas connection');
        console.log('');
      }
    });

    // Initialize email service (non-blocking)
    Mailer.verifyConnection().catch(error => {
      console.log('⚠️ Email service will be initialized on first use');
    });

    // Schedule OTP cleanup (every hour) - only if DB connected
    if (dbConnected) {
      setInterval(async () => {
        await OTPService.cleanExpiredOTPs();
      }, 60 * 60 * 1000);
    }
    
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();