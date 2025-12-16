const express = require('express');
const cookieParser = require('cookie-parser');

const security = require('./middlewares/security');
const errorHandler = require('./middlewares/errorHandler');
const { checkDatabaseConnection } = require('./middlewares/databaseCheck');

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middlewares
app.use(security.helmet);
app.use(security.cors);
app.use(security.xss);
app.use(security.rateLimit);

// Body parsing middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Root route for Render health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'BONDS API Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      server: 'running',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      email: 'configured'
    },
    environment: process.env.NODE_ENV || 'development'
  };

  // Return 503 if database is down but server is up
  const statusCode = health.services.database === 'connected' ? 200 : 503;
  
  res.status(statusCode).json(health);
});

// Simple test endpoint that doesn't require database
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API server is working!',
    timestamp: new Date().toISOString()
  });
});

// Email service test endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    const MailerService = require('./utils/mailer');
    
    // Check environment variables
    const emailConfig = {
      EMAIL_USER: process.env.EMAIL_USER ? 'configured' : 'missing',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'configured' : 'missing'
    };
    
    // Try to initialize email service
    let emailStatus = 'not_initialized';
    let emailError = null;
    
    try {
      await MailerService.initialize();
      emailStatus = 'initialized';
    } catch (error) {
      emailStatus = 'failed';
      emailError = error.message;
    }
    
    res.json({
      success: true,
      message: 'Email service test',
      config: emailConfig,
      status: emailStatus,
      error: emailError,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Routes
app.use('/api/auth', security.authRateLimit, checkDatabaseConnection, require('./routes/auth'));
app.use('/api/users', checkDatabaseConnection, require('./routes/userManagement'));
app.use('/api/memory', checkDatabaseConnection, require('./routes/memory'));
app.use('/api/timeline', checkDatabaseConnection, require('./routes/timeline'));
app.use('/api/thought', checkDatabaseConnection, require('./routes/thought'));
app.use('/api/trip', checkDatabaseConnection, require('./routes/trip'));
app.use('/api/music', checkDatabaseConnection, require('./routes/music'));
app.use('/api/comment', checkDatabaseConnection, require('./routes/comment'));

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;