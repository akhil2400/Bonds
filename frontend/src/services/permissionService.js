import api from './api';

class PermissionService {
  /**
   * Get current user's permissions from backend
   */
  async getUserPermissions() {
    try {
      const response = await api.get('/users/permissions');
      return response.data.permissions;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      // Return default viewer permissions on error
      return {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        isAdmin: false,
        role: 'viewer'
      };
    }
  }

  /**
   * Check if user can perform a specific action
   */
  canPerformAction(permissions, action) {
    if (!permissions) return false;

    switch (action) {
      case 'view':
        return permissions.canView;
      case 'create':
        return permissions.canCreate;
      case 'edit':
        return permissions.canEdit;
      case 'delete':
        return permissions.canDelete;
      case 'admin':
        return permissions.isAdmin;
      default:
        return false;
    }
  }

  /**
   * Get user role display name
   */
  getRoleDisplayName(role) {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'member':
        return 'Trusted Member';
      case 'viewer':
        return 'Viewer';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get role badge color
   */
  getRoleBadgeColor(role) {
    switch (role) {
      case 'admin':
        return '#96031a'; // Deep burgundy
      case 'member':
        return '#faa916'; // Golden orange
      case 'viewer':
        return '#6d676e'; // Purple-gray
      default:
        return '#6d676e';
    }
  }

  /**
   * Admin functions
   */
  async promoteUser(email) {
    try {
      const response = await api.post('/users/promote', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to promote user');
    }
  }

  async demoteUser(email) {
    try {
      const response = await api.post('/users/demote', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to demote user');
    }
  }

  async getAllUsers() {
    try {
      const response = await api.get('/users/users');
      return response.data.users;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch users');
    }
  }

  async initializeTrustedMembers() {
    try {
      const response = await api.post('/users/initialize');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to initialize trusted members');
    }
  }
}

export const permissionService = new PermissionService();