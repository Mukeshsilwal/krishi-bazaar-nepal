import api from './api';

const aiService = {
    getRecommendation: async (data) => {
        const response = await api.post('/ai/recommendation', data);
        return response.data;
    }
};

export default aiService;
