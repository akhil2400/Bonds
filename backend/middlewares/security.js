const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const xss = require('xss-clean');

// Helmet configuration for security headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
});

// Rate limiting configuration
const rateLimitConfig = rateLimit({
  windowMs: process.env.NODE_ENV === 'development' ? 5 * 60 * 1000 : 15 * 60 * 1000, // 5 min dev, 15 min prod
  max: process.env.NODE_ENV === 'development' ? 500 : 100, // 500 requests dev, 100 requests prod
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiting for auth endpoints
const authRateLimitConfig = rateLimit({
  windowMs: process.env.NODE_ENV === 'development' ? 5 * 60 * 1000 : 15 * 60 * 1000, // 5 min dev, 15 min prod
  max: process.env.NODE_ENV === 'development' ? 50 : 5, // 50 requests dev, 5 requests prod
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// CORS configuration for production
const corsConfig = cors({
  origin: function (origin, callback) {
    // Production frontend URL
    const PRODUCTION_FRONTEND = 'https://bonds-one.vercel.app';
    
    const allowedOrigins = [
      process.env.CLIENT_URL,
      PRODUCTION_FRONTEND,
      // Local development (only in development mode)
      ...(process.env.NODE_ENV === 'development' ? [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:5177',
        // Network access for mobile devices
        'http://192.168.18.210:5173',
        'http://192.168.18.210:5174',
        'http://192.168.18.210:5175',
        'http://192.168.18.210:5176',
        'http://192.168.56.1:5173',
        'http://192.168.56.1:5174',
        'http://192.168.56.1:5175',
        'http://192.168.56.1:5176'
      ] : [])
    ].filter(Boolean); // Remove undefined values
    
    // Allow requests with no origin (mobile apps, etc.) in development only
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, allow specific Vercel URLs only
    if (process.env.NODE_ENV === 'production' && origin) {
      // Allow main production URL
      if (origin === PRODUCTION_FRONTEND) {
        return callback(null, true);
      }
      
      // Allow Vercel preview URLs (*.vercel.app) for staging
      if (origin.endsWith('.vercel.app') && origin.includes('bonds')) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      console.log('✅ Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Forwarded-For',
    'X-Real-IP'
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
});

module.exports = {
  helmet: helmetConfig,
  rateLimit: rateLimitConfig,
  authRateLimit: authRateLimitConfig,
  cors: corsConfig,
  xss: xss()
};