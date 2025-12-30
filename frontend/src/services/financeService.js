import api from './api';

const financeService = {
    // Loans
    applyForLoan: async (data) => {
        const response = await api.post('/finance/loans', data);
        return response.data;
    },

    getLoans: async (farmerId) => {
        const response = await api.get('/finance/loans', { params: { farmerId } });
        return response.data;
    },

    // Insurance
    applyForInsurance: async (data) => {
        const response = await api.post('/finance/insurance', data);
        return response.data;
    },

    getPolicies: async (farmerId) => {
        const response = await api.get('/finance/insurance', { params: { farmerId } });
        return response.data;
    },

    // Subsidies
    getAllSubsidies: async () => {
        const response = await api.get('/subsidies');
        return response.data;
    },

    createSubsidy: async (data) => { // Admin only
        const response = await api.post('/subsidies', data);
        return response.data;
    }
};

export default financeService;
