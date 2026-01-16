/**
 * Permission utility functions for frontend authorization.
 * These functions check if a user has specific permissions.
 */

/**
 * Check if user has a specific permission.
 * @param userPermissions - Array of permission strings from user's JWT token
 * @param required - Required permission string (e.g., 'ORDER:CREATE')
 * @returns true if user has the permission
 */
export const hasPermission = (
    userPermissions: string[],
    required: string
): boolean => {
    if (!userPermissions || !Array.isArray(userPermissions)) {
        return false;
    }
    return userPermissions.includes(required);
};

/**
 * Check if user has ANY of the specified permissions.
 * @param userPermissions - Array of permission strings from user's JWT token
 * @param required - Array of required permissions
 * @returns true if user has at least one of the permissions
 */
export const hasAnyPermission = (
    userPermissions: string[],
    required: string[]
): boolean => {
    if (!userPermissions || !Array.isArray(userPermissions)) {
        return false;
    }
    return required.some((permission) => userPermissions.includes(permission));
};

/**
 * Check if user has ALL of the specified permissions.
 * @param userPermissions - Array of permission strings from user's JWT token
 * @param required - Array of required permissions
 * @returns true if user has all of the permissions
 */
export const hasAllPermissions = (
    userPermissions: string[],
    required: string[]
): boolean => {
    if (!userPermissions || !Array.isArray(userPermissions)) {
        return false;
    }
    return required.every((permission) => userPermissions.includes(permission));
};

/**
 * Filter items based on permission requirements.
 * Useful for filtering menu items, buttons, etc.
 * @param items - Array of items with optional permission property
 * @param userPermissions - Array of permission strings from user's JWT token
 * @returns Filtered array of items user has permission for
 */
export const filterByPermission = <T extends { permission?: string }>(
    items: T[],
    userPermissions: string[]
): T[] => {
    return items.filter((item) => {
        if (!item.permission) return true; // No permission required
        return hasPermission(userPermissions, item.permission);
    });
};
