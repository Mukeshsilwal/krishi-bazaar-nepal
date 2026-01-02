import api from './api';
import { FINANCE_ENDPOINTS, SUBSIDY_ENDPOINTS } from '../config/endpoints';

const financeService = {
    // Loans
    applyForLoan: async (data) => {
        const response = await api.post(FINANCE_ENDPOINTS.APPLY_LOAN, data);
        return response.data;
    },

    getLoans: async (farmerId) => {
        const response = await api.get(FINANCE_ENDPOINTS.LOANS, { params: { farmerId } });
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
        const response = await api.get(SUBSIDY_ENDPOINTS.BASE);
        return response.data;
    },

    createSubsidy: async (data) => { // Admin only
        const response = await api.post(SUBSIDY_ENDPOINTS.BASE, data);
        return response.data;
    }
};

export default financeService;
