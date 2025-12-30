import api from './api';

const notificationService = {
    getNotifications: async (userId) => {
        const response = await api.get(`/notifications?userId=${userId}`);
        return response.data;
    },

    getUnreadCount: async (userId) => {
        const response = await api.get(`/notifications/unread-count?userId=${userId}`);
        return response.data;
    },

    markAsRead: async (id) => {
        await api.put(`/notifications/${id}/read`);
    }
};

export default notificationService;
