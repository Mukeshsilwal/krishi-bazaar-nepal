import api from './api';

export const getCalendarEvents = async (category?: string) => {
    let url = '/agriculture-calendar'; // Verify base path from controller
    if (category) {
        url += `?category=${category}`;
    }
    const response = await api.get(url);
    return response.data;
};
