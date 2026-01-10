import api from './api';
import { COLD_STORAGE_ENDPOINTS, LOGISTICS_ENDPOINTS } from '../config/endpoints';

const logisticsService = {
    // Cold Storage
    getAllColdStorages: async (district) => {
        const params = district ? { district } : {};
        const response = await api.get(COLD_STORAGE_ENDPOINTS.BASE, { params });
        return response.data.data;
    },

    createColdStorage: async (data) => {
        const response = await api.post(COLD_STORAGE_ENDPOINTS.BASE, data);
        return response.data.data;
    },

    getAllBookings: async () => {
        const response = await api.get(`${COLD_STORAGE_ENDPOINTS.BASE}/bookings`);
        return response.data.data;
    },

    bookStorage: async (coldStorageId, bookingData) => {
        const response = await api.post(`${COLD_STORAGE_ENDPOINTS.BASE}/${coldStorageId}/book`, bookingData);
        return response.data.data;
    },

    // Shipments
    getShipmentByOrder: async (orderId) => {
        const response = await api.get(LOGISTICS_ENDPOINTS.SHIPMENT_BY_ORDER(orderId));
        return response.data.data;
    },

    trackShipment: async (trackingCode) => {
        const response = await api.get(LOGISTICS_ENDPOINTS.TRACK_BY_CODE(trackingCode));
        return response.data.data;
    },

    updateStatus: async (id, status) => {
        await api.put(LOGISTICS_ENDPOINTS.UPDATE_STATUS(id), status);
    }
};

export default logisticsService;
