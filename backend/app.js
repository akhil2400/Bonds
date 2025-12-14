const express = require('express');
const cookieParser = require('cookie-parser');

const security = require('./middlewares/security');
const errorHandler = require('./middlewares/errorHandler');

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

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Routes
app.use('/api/auth', security.authRateLimit, require('./routes/auth'));
app.use('/api/memory', require('./routes/memory'));
app.use('/api/timeline', require('./routes/timeline'));
app.use('/api/thought', require('./routes/thought'));
app.use('/api/trip', require('./routes/trip'));
app.use('/api/music', require('./routes/music'));
app.use('/api/comment', require('./routes/comment'));

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;