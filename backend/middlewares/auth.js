const jwt = require('jsonwebtoken');
const AuthRepository = require('../repositories/AuthRepository');
const CustomError = require('../errors/CustomError');

const auth = async (req, res, next) => {
  try {
    // Debug: Log cookies and headers received
    console.log('🍪 Cookies received:', Object.keys(req.cookies));
    console.log('🔍 Authorization header:', req.headers.authorization ? 'Present' : 'Not present');
    
    // Try to get token from httpOnly cookie first
    let token = req.cookies.accessToken;
    
    // If no cookie token, try Authorization header as fallback
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('✅ Token found in Authorization header');
      }
    }

    if (!token) {
      console.log('❌ No token found in cookies or Authorization header');
      throw new CustomError('Access denied. No token provided', 401);
    }
    
    console.log('✅ Token found, verifying...');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await AuthRepository.findById(decoded.userId);
    
    if (!user) {
      throw new CustomError('Invalid token. User not found', 401);
    }

    if (!user.isActive) {
      throw new CustomError('Account is deactivated', 401);
    }

    // Attach user to request with all necessary fields for authorization
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isTrustedMember: user.isTrustedMember,
      isActive: user.isActive,
      isVerified: user.isVerified
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new CustomError('Invalid token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new CustomError('Token expired', 401));
    }
    next(error);
  }
};

module.exports = auth;