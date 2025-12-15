const AuthRepository = require('../repositories/AuthRepository');
const CustomError = require('../errors/CustomError');
const { TRUSTED_MEMBER_EMAILS } = require('../middlewares/authorization');

class UserManagementService {
  /**
   * Promote a user to trusted member status
   * Only admins can perform this action
   */
  async promoteTrustedMember(adminUser, targetEmail) {
    // Verify admin permissions
    if (adminUser.role !== 'admin') {
      throw new CustomError('Only admins can promote users to trusted members', 403);
    }

    // Find target user
    const targetUser = await AuthRepository.findByEmail(targetEmail);
    if (!targetUser) {
      throw new CustomError('User not found', 404);
    }

    // Check if email is in trusted list
    if (!TRUSTED_MEMBER_EMAILS.includes(targetEmail.toLowerCase())) {
      throw new CustomError('Email not in trusted members list', 400);
    }

    // Update user
    const updatedUser = await AuthRepository.updateById(targetUser._id, {
      role: 'member',
      isTrustedMember: true
    });

    console.log(`✅ User promoted to trusted member: ${targetEmail} by admin: ${adminUser.email}`);

    return {
      success: true,
      message: 'User promoted to trusted member successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isTrustedMember: updatedUser.isTrustedMember
      }
    };
  }

  /**
   * Demote a trusted member to viewer
   * Only admins can perform this action
   */
  async demoteTrustedMember(adminUser, targetEmail) {
    if (adminUser.role !== 'admin') {
      throw new CustomError('Only admins can demote trusted members', 403);
    }

    const targetUser = await AuthRepository.findByEmail(targetEmail);
    if (!targetUser) {
      throw new CustomError('User not found', 404);
    }

    // Prevent admin from demoting themselves
    if (targetUser.email === adminUser.email) {
      throw new CustomError('Cannot demote yourself', 400);
    }

    const updatedUser = await AuthRepository.updateById(targetUser._id, {
      role: 'viewer',
      isTrustedMember: false
    });

    console.log(`⚠️ User demoted from trusted member: ${targetEmail} by admin: ${adminUser.email}`);

    return {
      success: true,
      message: 'User demoted from trusted member successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isTrustedMember: updatedUser.isTrustedMember
      }
    };
  }

  /**
   * Get all users with their roles and permissions
   */
  async getAllUsers(requestingUser) {
    if (requestingUser.role !== 'admin') {
      throw new CustomError('Only admins can view all users', 403);
    }

    const users = await AuthRepository.findAll();

    return users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isTrustedMember: user.isTrustedMember,
      isActive: user.isActive,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
  }

  /**
   * Initialize trusted members (run once during setup)
   */
  async initializeTrustedMembers() {
    console.log('🔧 Initializing trusted members...');

    for (const email of TRUSTED_MEMBER_EMAILS) {
      try {
        const user = await AuthRepository.findByEmail(email);
        if (user && !user.isTrustedMember) {
          await AuthRepository.updateById(user._id, {
            role: user.role === 'admin' ? 'admin' : 'member',
            isTrustedMember: true
          });
          console.log(`✅ Initialized trusted member: ${email}`);
        }
      } catch (error) {
        console.log(`⚠️ Could not initialize trusted member ${email}:`, error.message);
      }
    }

    console.log('✅ Trusted members initialization complete');
  }

  /**
   * Get user permissions for frontend
   */
  async getUserPermissions(userId) {
    const user = await AuthRepository.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const { getUserPermissions } = require('../middlewares/authorization');
    return getUserPermissions(user);
  }
}

module.exports = new UserManagementService();