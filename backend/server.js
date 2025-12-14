require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');
const Mailer = require('./utils/mailer');
const OTPService = require('./services/OTPService');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`OTP Expiry: ${process.env.OTP_EXPIRY_MINUTES || 5} minutes`);
    });

    // Initialize email service (non-blocking)
    Mailer.verifyConnection().catch(error => {
      console.log('⚠️ Email service will be initialized on first use');
    });

    // Schedule OTP cleanup (every hour)
    setInterval(async () => {
      await OTPService.cleanExpiredOTPs();
    }, 60 * 60 * 1000);
    
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();