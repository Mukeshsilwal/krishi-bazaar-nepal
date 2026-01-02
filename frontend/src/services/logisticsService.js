import api from './api';
import { COLD_STORAGE_ENDPOINTS, LOGISTICS_ENDPOINTS } from '../config/endpoints';

const logisticsService = {
    // Cold Storage
    getAllColdStorages: async (district) => {
        const params = district ? { district } : {};
        const response = await api.get(COLD_STORAGE_ENDPOINTS.BASE, { params });
        return response.data;
    },

    createColdStorage: async (data) => {
        const response = await api.post(COLD_STORAGE_ENDPOINTS.BASE, data);
        return response.data;
    },

    // Logistics Orders
    bookLogistics: async (data) => {
        const response = await api.post(LOGISTICS_ENDPOINTS.BOOK, data);
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
