import api from './api';
import { ADMIN_ENDPOINTS } from '../config/endpoints';

const adminService = {
    getDashboardStats: async () => {
        const response = await api.get(ADMIN_ENDPOINTS.DASHBOARD);
        return response.data.data; // Extract from ApiResponse wrapper
    },

    getPendingVendors: async () => {
        const response = await api.get(ADMIN_ENDPOINTS.VENDORS_PENDING);
        return response.data;
    },

    getUserActivities: async (params) => {
        const response = await api.get(ADMIN_ENDPOINTS.ACTIVITIES, { params });
        return response.data.data;
    },

    approveUser: async (userId) => {
        await api.post(ADMIN_ENDPOINTS.APPROVE_USER(userId));
    }
};

export default adminService;
