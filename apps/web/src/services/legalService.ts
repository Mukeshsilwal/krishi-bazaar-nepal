import api from './api';

const legalService = {
    // Public endpoints
    getPrivacyPolicy: async () => {
        const response = await api.get('/legal/privacy-policy');
        return response.data;
    },

    getTermsOfService: async () => {
        const response = await api.get('/legal/terms-of-service');
        return response.data;
    },

    getDocumentByVersion: async (type, version) => {
        const response = await api.get(`/legal/${type}/version/${version}`);
        return response.data;
    },

    // Admin endpoints
    getAllDocuments: async () => {
        const response = await api.get('/admin/legal');
        return response.data;
    },

    getDocumentsByType: async (type) => {
        const response = await api.get(`/admin/legal/type/${type}`);
        return response.data;
    },

    createDocument: async (data) => {
        const response = await api.post('/admin/legal', data);
        return response.data;
    },

    updateDocument: async (id, data) => {
        const response = await api.put(`/admin/legal/${id}`, data);
        return response.data;
    },

    activateDocument: async (id) => {
        const response = await api.put(`/admin/legal/${id}/activate`);
        return response.data;
    },

    deleteDocument: async (id) => {
        const response = await api.delete(`/admin/legal/${id}`);
        return response.data;
    },
};

export default legalService;
