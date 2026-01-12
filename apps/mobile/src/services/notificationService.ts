import api from './api';

export const getNotifications = async () => {
    const response = await api.get('/notifications');
    return response.data;
};

export const markNotificationRead = async (id: string) => {
    await api.put(`/notifications/${id}/read`);
};

export const getNotificationUnreadCount = async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
};
