import { usePermissions } from '../../context/PermissionContext';

/**
 * PermissionGate Component
 * 
 * Conditionally renders children based on user permissions
 * 
 * Usage:
 * <PermissionGate action="create">
 *   <button>Add Memory</button>
 * </PermissionGate>
 */

const PermissionGate = ({ 
  action, 
  role, 
  fallback = null, 
  children,
  showFallback = false 
}) => {
  const { canPerformAction, getUserRole, loading } = usePermissions();

  // Show loading state
  if (loading) {
    return null;
  }

  // Check action-based permission
  if (action && !canPerformAction(action)) {
    return showFallback ? fallback : null;
  }

  // Check role-based permission
  if (role && getUserRole() !== role) {
    return showFallback ? fallback : null;
  }

  return children;
};

export default PermissionGate;