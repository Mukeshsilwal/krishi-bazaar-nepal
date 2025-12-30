import api from './api';

const logisticsService = {
    // Cold Storage
    getAllColdStorages: async (district) => {
        const params = district ? { district } : {};
        const response = await api.get('/cold-storage', { params });
        return response.data;
    },

    createColdStorage: async (data) => {
        const response = await api.post('/cold-storage', data);
        return response.data;
    },

    // Logistics Orders
    bookLogistics: async (data) => {
        const response = await api.post('/logistics/book', data);
        return response.data;
    },

    getStatus: async (orderId) => {
        const response = await api.get(`/logistics/status`, { params: { orderId } });
        return response.data;
    },

    updateStatus: async (id, status) => {
        await api.put(`/logistics/${id}/status`, status);
    }
};

export default logisticsService;
