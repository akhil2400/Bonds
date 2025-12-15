const CustomError = require('../errors/CustomError');

/**
 * Authorization Middleware for Trusted Members Only
 * 
 * This middleware ensures that only the 4 trusted friends can create, update, or delete content.
 * It checks both the user's role and their trusted member status.
 */

// List of trusted member emails (the 4 friends)
const TRUSTED_MEMBER_EMAILS = [
  process.env.TRUSTED_EMAIL_1 || 'user1@example.com',
  process.env.TRUSTED_EMAIL_2 || 'user2@example.com', 
  process.env.TRUSTED_EMAIL_3 || 'user3@example.com',
  process.env.TRUSTED_EMAIL_4 || 'user4@example.com'
];

/**
 * Middleware to allow only trusted members (admin/member roles) to perform mutations
 */
const allowOnlyTrustedMembers = (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const { role, email, isTrustedMember } = req.user;

    // Check if user is one of the trusted members
    const isTrustedEmail = TRUSTED_MEMBER_EMAILS.includes(email.toLowerCase());
    
    // User must be either:
    // 1. Have admin or member role AND be a trusted member, OR
    // 2. Be in the trusted emails list (for backward compatibility)
    const canCreateContent = (
      (role === 'admin' || role === 'member') && 
      (isTrustedMember || isTrustedEmail)
    );

    if (!canCreateContent) {
      throw new CustomError(
        'Access denied. Only trusted members can create, update, or delete content.',
        403
      );
    }

    // Log the action for security monitoring
    console.log(`✅ Trusted member access granted: ${email} (${role})`);
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to allow only admin users
 */
const allowOnlyAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const { role, email } = req.user;

    if (role !== 'admin') {
      throw new CustomError('Admin access required', 403);
    }

    console.log(`✅ Admin access granted: ${email}`);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can view content (authenticated users)
 */
const allowAuthenticatedUsers = (req, res, next) => {
  try {
    if (!req.user) {
      throw new CustomError('Authentication required to view content', 401);
    }

    console.log(`✅ View access granted: ${req.user.email} (${req.user.role})`);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to check if user is trusted member (for use in services)
 */
const isTrustedMember = (user) => {
  if (!user) return false;
  
  const { role, email, isTrustedMember: trustedFlag } = user;
  const isTrustedEmail = TRUSTED_MEMBER_EMAILS.includes(email.toLowerCase());
  
  return (role === 'admin' || role === 'member') && (trustedFlag || isTrustedEmail);
};

/**
 * Helper function to get user permissions
 */
const getUserPermissions = (user) => {
  if (!user) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      isAdmin: false
    };
  }

  const trusted = isTrustedMember(user);
  const isAdmin = user.role === 'admin';

  return {
    canView: true, // All authenticated users can view
    canCreate: trusted,
    canEdit: trusted,
    canDelete: trusted || isAdmin, // Admins can delete anything
    isAdmin: isAdmin,
    role: user.role
  };
};

module.exports = {
  allowOnlyTrustedMembers,
  allowOnlyAdmin,
  allowAuthenticatedUsers,
  isTrustedMember,
  getUserPermissions,
  TRUSTED_MEMBER_EMAILS
};