import api from './api';

export const getArticles = async () => {
    const response = await api.get('/knowledge/articles');
    return response.data; // Assuming standard ApiResponse
};

export const getArticleDetail = async (id: string) => {
    const response = await api.get(`/knowledge/articles/${id}`);
    return response.data.data;
};
