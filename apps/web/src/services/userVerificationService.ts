import api from './api';
import { ADMIN_RBAC_ENDPOINTS } from '@/config/endpoints';

/**
 * Service for managing user verification in admin panel.
 * Handles approval/rejection of VENDOR and EXPERT registrations.
 */
const userVerificationService = {
    /**
     * Get all pending (unverified) users
     * @param {number} page - Page number (0-indexed)
     * @param {number} size - Page size
     * @returns {Promise} Paginated list of pending users
     */
    getPendingUsers: async (page = 0, size = 10) => {
        const response = await api.get(ADMIN_RBAC_ENDPOINTS.PENDING_USERS, {
            params: { page, size, sort: 'createdAt,desc' }
        });
        return response.data;
    },

    /**
     * Get all verified users
     * @param {number} page - Page number (0-indexed)
     * @param {number} size - Page size
     * @returns {Promise} Paginated list of verified users
     */
    getVerifiedUsers: async (page = 0, size = 10) => {
        const response = await api.get(ADMIN_RBAC_ENDPOINTS.VERIFIED_USERS, {
            params: { page, size, sort: 'createdAt,desc' }
        });
        return response.data;
    },

    /**
     * Verify/approve a user
     * @param {string} userId - User ID
     * @returns {Promise} Updated user data
     */
    verifyUser: async (userId) => {
        const response = await api.put(ADMIN_RBAC_ENDPOINTS.VERIFY_USER(userId));
        return response.data;
    },

    /**
     * Unverify/revoke verification of a user
     * @param {string} userId - User ID
     * @returns {Promise} Updated user data
     */
    unverifyUser: async (userId) => {
        const response = await api.put(ADMIN_RBAC_ENDPOINTS.UNVERIFY_USER(userId));
        return response.data;
    },

    /**
     * Delete a pending user (reject registration)
     * @param {string} userId - User ID
     * @returns {Promise} Success response
     */
    deleteUser: async (userId) => {
        const response = await api.delete(ADMIN_RBAC_ENDPOINTS.DELETE_USER(userId));
        return response.data;
    },
};

export default userVerificationService;
