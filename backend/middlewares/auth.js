const jwt = require('jsonwebtoken');
const AuthRepository = require('../repositories/AuthRepository');
const CustomError = require('../errors/CustomError');

const auth = async (req, res, next) => {
  try {
    // Get token from httpOnly cookie
    const token = req.cookies.accessToken;

    if (!token) {
      throw new CustomError('Access denied. No token provided', 401);
    }

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