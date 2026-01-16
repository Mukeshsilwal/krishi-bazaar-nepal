import { useAuth } from '../modules/auth/context/AuthContext';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissionUtils';

/**
 * Hook to check if current user has a specific permission.
 * @param permission - Required permission string (e.g., 'ORDER:CREATE')
 * @returns true if user has the permission
 */
export const usePermission = (permission: string): boolean => {
    const { permissions } = useAuth();
    return hasPermission(permissions || [], permission);
};

/**
 * Hook to check if current user has any of the specified permissions.
 * @param permissions - Array of required permissions
 * @returns true if user has at least one permission
 */
export const useAnyPermission = (permissions: string[]): boolean => {
    const { permissions: userPermissions } = useAuth();
    return hasAnyPermission(userPermissions || [], permissions);
};

/**
 * Hook to check if current user has all of the specified permissions.
 * @param permissions - Array of required permissions
 * @returns true if user has all permissions
 */
export const useAllPermissions = (permissions: string[]): boolean => {
    const { permissions: userPermissions } = useAuth();
    return hasAllPermissions(userPermissions || [], permissions);
};
