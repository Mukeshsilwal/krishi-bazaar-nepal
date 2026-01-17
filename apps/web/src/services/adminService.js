import api from './api';
import { ADMIN_ENDPOINTS, ADVISORY_LOG_ENDPOINTS } from '../config/endpoints';

const adminService = {
    getDashboardStats: async () => {
        const response = await api.get(ADMIN_ENDPOINTS.DASHBOARD);
        if (response.data.code === 0) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to fetch dashboard stats');
    },

    getPendingVendors: async () => {
        // Request large size for now as UI might be list-based
        const response = await api.get(ADMIN_ENDPOINTS.VENDORS_PENDING + '?page=0&size=100');
        // Return content from PaginatedResponse
        return response.data.data.content;
    },

    getUserActivities: async (params) => {
        const response = await api.get(ADMIN_ENDPOINTS.ACTIVITIES, { params });
        return response.data.data;
    },

    approveUser: async (userId) => {
        await api.post(ADMIN_ENDPOINTS.APPROVE_USER(userId));
    },

    getDistrictRiskAnalytics: async () => {
        const response = await api.get(ADVISORY_LOG_ENDPOINTS.DISTRICT_RISK);
        if (response.data.code === 0) {
            return response.data.data;
        }
        return [];
    }
};

export default adminService;
