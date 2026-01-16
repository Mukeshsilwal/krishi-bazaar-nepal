import { useAuth } from '../modules/auth/context/AuthContext';

/**
 * PermissionGate Component
 * 
 * Conditionally renders children based on user permissions.
 * Use this for UI elements that should be hidden/shown based on permissions.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render if user has permission
 * @param {string} [props.permission] - Single required permission
 * @param {string[]} [props.anyPermission] - User must have at least one of these permissions
 * @param {string[]} [props.allPermissions] - User must have all of these permissions
 * @param {React.ReactNode} [props.fallback] - Content to render if user lacks permission
 */
const PermissionGate = ({
    children,
    permission,
    anyPermission,
    allPermissions,
    fallback = null
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

    // Check single permission
    if (permission && !hasPermission(permission)) {
        return fallback;
    }

    // Check any of multiple permissions
    if (anyPermission && anyPermission.length > 0 && !hasAnyPermission(anyPermission)) {
        return fallback;
    }

    // Check all permissions
    if (allPermissions && allPermissions.length > 0 && !hasAllPermissions(allPermissions)) {
        return fallback;
    }

    // User has required permissions
    return children;
};

export default PermissionGate;
