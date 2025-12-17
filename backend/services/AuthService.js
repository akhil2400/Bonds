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
    const { name, email, password, isVerified = false } = userData;

    // Check if user already exists by email
    if (email) {
      const existingUser = await AuthRepository.findByEmail(email);
      if (existingUser) {
        throw new CustomError('User already exists with this email', 400);
      }
    }



    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Determine user role and trusted status based on email
    const { TRUSTED_MEMBER_EMAILS } = require('../middlewares/authorization');
    const isTrustedEmail = email && TRUSTED_MEMBER_EMAILS.includes(email.toLowerCase());
    
    // Create user with appropriate role
    const user = await AuthRepository.createUser({
      name,
      email,
      password: hashedPassword,
      isVerified,
      role: isTrustedEmail ? 'member' : 'viewer', // Trusted emails get member role
      isTrustedMember: isTrustedEmail // Mark as trusted if in the list
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isTrustedMember: user.isTrustedMember,
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
        role: user.role,
        isTrustedMember: user.isTrustedMember
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
      { expiresIn: '7d' } // Match cookie expiry
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    return { accessToken, refreshToken };
  }



  // Reset user password
  async resetUserPassword(email, newPassword) {
    try {
      // Hash the new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update user password
      const updatedUser = await AuthRepository.updatePassword(email, hashedPassword);

      if (!updatedUser) {
        throw new CustomError('User not found', 404);
      }

      console.log(`🔐 Password reset successfully for: ${email}`);

      return {
        success: true,
        message: 'Password reset successfully'
      };

    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error('Error in resetUserPassword:', error);
      throw new CustomError('Failed to reset password', 500);
    }
  }
}

module.exports = new AuthService();