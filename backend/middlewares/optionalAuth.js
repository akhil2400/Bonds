const jwt = require('jsonwebtoken');
const AuthRepository = require('../repositories/AuthRepository');

const optionalAuth = async (req, res, next) => {
  try {
    // Get token from httpOnly cookie
    const token = req.cookies.accessToken;

    if (!token) {
      // No token provided, continue without user
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await AuthRepository.findById(decoded.userId);
    
    if (user && user.isActive) {
      // Attach user to request if valid
      req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };
    }

    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};

module.exports = optionalAuth;