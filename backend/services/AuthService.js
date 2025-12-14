const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthRepository = require('../repositories/AuthRepository');
const CustomError = require('../errors/CustomError');

class AuthService {
  // Check if user exists (for signup validation)
  async checkUserExists(email) {
    try {
      const user = await AuthRepository.findByEmail(email);
      return !!user;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  async registerUser(userData) {
    const { name, email, mobile, password, isVerified = false } = userData;

    // Check if user already exists by email
    if (email) {
      const existingUser = await AuthRepository.findByEmail(email);
      if (existingUser) {
        throw new CustomError('User already exists with this email', 400);
      }
    }

    // Check if user already exists by mobile
    if (mobile) {
      const existingUserByMobile = await AuthRepository.findByMobile(mobile);
      if (existingUserByMobile) {
        throw new CustomError('User already exists with this mobile number', 400);
      }
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await AuthRepository.createUser({
      name,
      email,
      mobile,
      password: hashedPassword,
      isVerified,
      verificationMethod: mobile ? 'mobile' : 'email'
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified
      },
      accessToken,
      refreshToken
    };
  }

  async loginUser(email, password) {
    // Find user
    const user = await AuthRepository.findByEmail(email);
    if (!user) {
      throw new CustomError('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new CustomError('Account is deactivated', 401);
    }

    // Validate password
    const isValidPassword = await this.validatePassword(password, user.password);
    if (!isValidPassword) {
      throw new CustomError('Invalid credentials', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    return { accessToken, refreshToken };
  }
}

module.exports = new AuthService();