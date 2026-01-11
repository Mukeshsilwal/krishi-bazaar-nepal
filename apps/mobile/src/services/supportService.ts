import api from './api';

export const submitFeedback = async (type: string, message: string) => {
    // Matches Web: FEEDBACK_ENDPOINTS.BASE (likely /feedback)
    // Assuming backend endpoint /api/feedback
    const response = await api.post('/feedback', { type, message });
    return response.data;
};
