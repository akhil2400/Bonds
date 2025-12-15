import { usePermissions } from '../../context/PermissionContext';

/**
 * RoleBadge Component
 * 
 * Displays user's role with appropriate styling
 */

const RoleBadge = ({ className = '', size = 'normal' }) => {
  const { getRoleDisplayName, getRoleBadgeColor, getUserRole } = usePermissions();

  const role = getUserRole();
  const displayName = getRoleDisplayName();
  const color = getRoleBadgeColor();

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    normal: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const badgeStyle = {
    backgroundColor: `${color}15`, // 15% opacity
    color: color,
    border: `1px solid ${color}30` // 30% opacity
  };

  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${className}`}
      style={badgeStyle}
    >
      {displayName}
    </span>
  );
};

export default RoleBadge;