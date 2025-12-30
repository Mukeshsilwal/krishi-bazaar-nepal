import api from './api';

const adminService = {
    getDashboardStats: async () => {
        const response = await api.get('/admin/dashboard');
        return response.data;
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
