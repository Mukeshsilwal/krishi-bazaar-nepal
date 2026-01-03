import api from './api';
import { AI_ENDPOINTS } from '../config/endpoints';


const aiService = {
    getRecommendation: async (query, userId, imageUrl) => {
        const payload = { query, imageUrl };
        const response = await api.post(AI_ENDPOINTS.RECOMMENDATION, payload);
        return response.data;
    },
};

export default aiService;
