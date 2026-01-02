import api from './api';
import { ADMIN_ENDPOINTS } from '../config/endpoints';

const adminService = {
    getDashboardStats: async () => {
        const response = await api.get(ADMIN_ENDPOINTS.DASHBOARD);
        return response.data.data; // Extract from ApiResponse wrapper
    },

    getPendingVendors: async () => {
        const response = await api.get('/admin/vendors/pending');
        return response.data;
    },

    approveUser: async (userId) => {
        await api.post(`/admin/users/${userId}/approve`);
    }
};

export default adminService;
