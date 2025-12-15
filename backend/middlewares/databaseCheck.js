const mongoose = require('mongoose');
const CustomError = require('../errors/CustomError');

/**
 * Middleware to check database connection before processing requests
 * Returns appropriate error if database is not available
 */
const checkDatabaseConnection = (req, res, next) => {
  // Skip database check for health endpoint
  if (req.path === '/health') {
    return next();
  }

  // Check if mongoose is connected
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: 'Database service unavailable. Please check MongoDB Atlas connection.',
      code: 'DATABASE_UNAVAILABLE',
      troubleshooting: {
        message: 'MongoDB Atlas connection failed',
        steps: [
          'Check if your IP address is whitelisted in MongoDB Atlas',
          'Go to Network Access in your Atlas dashboard',
          'Add your current IP address or use 0.0.0.0/0 for development',
          'Verify your connection string in .env file'
        ]
      }
    });
  }

  next();
};

/**
 * Wrapper for database operations to handle connection issues
 */
const withDatabaseErrorHandling = (operation) => {
  return async (...args) => {
    try {
      // Check connection state before operation
      if (mongoose.connection.readyState !== 1) {
        throw new CustomError('Database not connected', 503);
      }

      return await operation(...args);
    } catch (error) {
      // Handle specific MongoDB errors
      if (error.name === 'MongooseError' || error.name === 'MongoError') {
        throw new CustomError('Database operation failed. Please check your connection.', 503);
      }
      
      // Handle timeout errors
      if (error.message.includes('buffering timed out')) {
        throw new CustomError('Database connection timeout. Please check MongoDB Atlas.', 503);
      }

      // Re-throw other errors
      throw error;
    }
  };
};

module.exports = {
  checkDatabaseConnection,
  withDatabaseErrorHandling
};