import api from './api';
import { AI_ENDPOINTS } from '../config/endpoints';


const aiService = {
    getRecommendation: async (payload) => {
        const response = await api.post(AI_ENDPOINTS.RECOMMENDATION, payload);
        return response.data;
    },
};

export default aiService;
