import api from './api';
import { ADMIN_RBAC_ENDPOINTS } from '../config/endpoints';

/**
 * Admin RBAC Service for managing roles and permissions.
 * All endpoints require ADMIN:ROLES permission.
 */

/**
 * Get all roles with their permissions.
 * @returns Promise<Role[]>
 */
export const getAllRoles = async () => {
    // Request large page size for backward compatibility
    const response = await api.get(ADMIN_RBAC_ENDPOINTS.ROLES, {
        params: { size: 100 }
    });
    // Handle paginated response
    if (response.data && response.data.content) {
        return response.data.content;
    }
    return response.data;
};

/**
 * Create a new custom role.
 * @param {Object} roleData - Role creation data
 * @param {string} roleData.name - Role name (will be uppercased)
 * @param {string} roleData.description - Role description
 * @param {string[]} roleData.permissionNames - Array of permission names
 * @returns Promise<Role>
 */
export const createRole = async (roleData) => {
    const response = await api.post(ADMIN_RBAC_ENDPOINTS.ROLES, roleData);
    return response.data;
};

/**
 * Update role permissions.
 * @param {string} roleId - Role ID
 * @param {string[]} permissionNames - Array of permission names
 * @returns Promise<Role>
 */
export const updateRolePermissions = async (roleId, permissionNames) => {
    const response = await api.put(
        ADMIN_RBAC_ENDPOINTS.UPDATE_ROLE_PERMISSIONS(roleId),
        permissionNames
    );
    return response.data;
};

/**
 * Delete a custom role.
 * System-defined roles cannot be deleted.
 * @param {string} roleId - Role ID
 * @param {string[]} roleData.permissionNames - Array of permission names
 * @returns Promise<void>
 */
export const deleteRole = async (roleId) => {
    const response = await api.delete(ADMIN_RBAC_ENDPOINTS.ROLE_BY_ID(roleId));
    return response.data;
};

/**
 * Get all permissions, optionally grouped by module.
 * @param {boolean} grouped - Whether to group permissions by module
 * @returns Promise<Permission[]>
 */
export const getAllPermissions = async (grouped = false) => {
    const response = await api.get(ADMIN_RBAC_ENDPOINTS.PERMISSIONS, {
        params: { grouped, size: 500 }
    });

    // Handle paginated response for non-grouped
    if (!grouped && response.data && response.data.content) {
        return response.data.content;
    }
    return response.data;
};

/**
 * Assign a role to a user.
 * @param {string} userId - User ID
 * @param {string} roleId - Role ID
 * @returns Promise<void>
 */
export const assignRoleToUser = async (userId, roleId) => {
    const response = await api.post(ADMIN_RBAC_ENDPOINTS.ASSIGN_ROLE(userId, roleId));
    return response.data;
};

/**
 * Remove a role from a user.
 * @param {string} userId - User ID
 * @param {string} roleId - Role ID
 * @returns Promise<void>
 */
export const removeRoleFromUser = async (userId, roleId) => {
    const response = await api.delete(ADMIN_RBAC_ENDPOINTS.REMOVE_ROLE(userId, roleId));
    return response.data;
};

export default {
    getAllRoles,
    createRole,
    updateRolePermissions,
    deleteRole,
    getAllPermissions,
    assignRoleToUser,
    removeRoleFromUser,
};
