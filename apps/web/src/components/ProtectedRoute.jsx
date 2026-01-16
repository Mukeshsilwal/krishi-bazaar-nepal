import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../modules/auth/context/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';

/**
 * ProtectedRoute Component
 * 
 * Protects routes based on authentication and permissions/roles.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string} [props.requiredRole] - Required role (legacy, checks user.role)
 * @param {string} [props.requiredPermission] - Single required permission
 * @param {string[]} [props.requiredAnyPermission] - User must have at least one of these permissions
 * @param {string[]} [props.requiredAllPermissions] - User must have all of these permissions
 * @param {string} [props.redirectTo] - Custom redirect path (default: /login or /admin/login)
 */
const ProtectedRoute = ({
    children,
    requiredRole,
    requiredPermission,
    requiredAnyPermission,
    requiredAllPermissions,
    redirectTo
}) => {
    const { user, permissions, loading, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return <LoadingSpinner />;
    }

    // Check if user is authenticated
    if (!user) {
        // Redirect to appropriate login page based on required role/permission
        const isAdminRoute = requiredRole === 'ADMIN' ||
            requiredPermission?.startsWith('ADMIN:') ||
            requiredAnyPermission?.some(p => p.startsWith('ADMIN:')) ||
            requiredAllPermissions?.some(p => p.startsWith('ADMIN:'));

        const defaultRedirect = isAdminRoute ? '/admin/login' : '/login';
        return <Navigate to={redirectTo || defaultRedirect} state={{ from: location }} replace />;
    }

    // Legacy role-based check (for backward compatibility)
    if (requiredRole) {
        const userRole = user.role;
        if (userRole !== requiredRole) {
            console.warn(`Access denied: Required role ${requiredRole}, user has ${userRole}`);
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // Permission-based checks (new RBAC system)
    if (requiredPermission) {
        if (!hasPermission(requiredPermission)) {
            console.warn(`Access denied: Missing required permission ${requiredPermission}`);
            return <Navigate to="/unauthorized" replace />;
        }
    }

    if (requiredAnyPermission && requiredAnyPermission.length > 0) {
        if (!hasAnyPermission(requiredAnyPermission)) {
            console.warn(`Access denied: Missing any of required permissions ${requiredAnyPermission.join(', ')}`);
            return <Navigate to="/unauthorized" replace />;
        }
    }

    if (requiredAllPermissions && requiredAllPermissions.length > 0) {
        if (!hasAllPermissions(requiredAllPermissions)) {
            console.warn(`Access denied: Missing all required permissions ${requiredAllPermissions.join(', ')}`);
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // User is authenticated and authorized
    return children;
};

export default ProtectedRoute;
