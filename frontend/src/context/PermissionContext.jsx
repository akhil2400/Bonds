import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { permissionService } from '../services/permissionService';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch permissions when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPermissions();
    } else {
      setPermissions(null);
    }
  }, [isAuthenticated, user]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const userPermissions = await permissionService.getUserPermissions();
      setPermissions(userPermissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      // Set default viewer permissions on error
      setPermissions({
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        isAdmin: false,
        role: 'viewer'
      });
    } finally {
      setLoading(false);
    }
  };

  // Permission check functions
  const canView = () => permissions?.canView || false;
  const canCreate = () => permissions?.canCreate || false;
  const canEdit = () => permissions?.canEdit || false;
  const canDelete = () => permissions?.canDelete || false;
  const isAdmin = () => permissions?.isAdmin || false;
  const isTrustedMember = () => permissions?.canCreate || false; // Trusted members can create

  // Role information
  const getUserRole = () => permissions?.role || 'viewer';
  const getRoleDisplayName = () => permissionService.getRoleDisplayName(getUserRole());
  const getRoleBadgeColor = () => permissionService.getRoleBadgeColor(getUserRole());

  // Check specific action
  const canPerformAction = (action) => {
    return permissionService.canPerformAction(permissions, action);
  };

  const value = {
    permissions,
    loading,
    canView,
    canCreate,
    canEdit,
    canDelete,
    isAdmin,
    isTrustedMember,
    getUserRole,
    getRoleDisplayName,
    getRoleBadgeColor,
    canPerformAction,
    fetchPermissions
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};