import api from './api';
import { AI_ENDPOINTS } from '../config/endpoints';

const aiService = {
    getRecommendation: async (query, farmerId, imageUrl = null) => {
        const payload = {
            farmerId,
            query,
            imageUrl
        };
        const response = await api.post('/ai/recommendation', payload);
        return response.data;
    }
};

export default aiService;
