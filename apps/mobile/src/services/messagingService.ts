import api from './api';

export const getConversations = async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
};

export const getMessages = async (userId: string) => {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
};

export const sendMessage = async (receiverId: string, content: string) => {
    const response = await api.post('/messages', { receiverId, content });
    return response.data;
};

export const markAsRead = async (userId: string) => {
    await api.put(`/messages/${userId}/read`);
};

export const getUnreadCount = async () => {
    const response = await api.get('/messages/unread/count');
    return response.data;
};
