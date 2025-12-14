const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error (in production, use proper logging service)
  // Skip logging for expected auth errors to reduce noise
  const isExpectedAuthError = err.statusCode === 401 && 
    (err.message.includes('No token provided') || 
     err.message.includes('Invalid token') || 
     err.message.includes('Token expired'));

  if (!isExpectedAuthError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌', err.message);
    } else {
      console.error(err.message);
    }
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    error = { message: 'CORS policy violation', statusCode: 403 };
  }

  // Rate limit errors
  if (err.status === 429) {
    error = { message: 'Too many requests', statusCode: 429 };
  }

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' && error.statusCode === 500
    ? 'Internal server error'
    : error.message || 'Server Error';

  res.status(error.statusCode || 500).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;