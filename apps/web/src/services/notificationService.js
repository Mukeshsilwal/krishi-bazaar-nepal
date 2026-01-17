import api from './api';
import { NOTIFICATION_ENDPOINTS } from '../config/endpoints';

const notificationService = {
    getNotifications: async (userId) => {
        const response = await api.get(`${NOTIFICATION_ENDPOINTS.BASE}?userId=${userId}`);
        return response.data.data;
    },

    getUnreadCount: async (userId) => {
        const response = await api.get(`${NOTIFICATION_ENDPOINTS.UNREAD_COUNT}?userId=${userId}`);
        return response.data.data; // Unwrapped from ApiResponse
    },

    markAsRead: async (id) => {
        await api.put(NOTIFICATION_ENDPOINTS.MARK_READ(id));
    },

    registerDeviceToken: async (token) => {
        const response = await api.post(NOTIFICATION_ENDPOINTS.TOKENS, { token });
        return response.data;
    }
};

export default notificationService;
