import api from './api';
import { FINANCE_ENDPOINTS } from '../config/endpoints';
import { SUBSIDY_ENDPOINTS } from '../config/endpoints';

const financeService = {
    // Loans
    applyForLoan: async (data) => {
        const response = await api.post(FINANCE_ENDPOINTS.APPLY_LOAN, data);
        return response.data.data;
    },

    getLoans: async (farmerId) => {
        const response = await api.get(FINANCE_ENDPOINTS.LOANS, { params: { farmerId } });
        return response.data.data;
    },

    // Insurance
    applyForInsurance: async (data) => {
        const response = await api.post(FINANCE_ENDPOINTS.INSURANCE, data);
        return response.data.data;
    },

    getPolicies: async (farmerId) => {
        const response = await api.get(FINANCE_ENDPOINTS.INSURANCE, { params: { farmerId } });
        return response.data.data;
    },

    // Subsidies
    getAllSubsidies: async () => {
        const response = await api.get(SUBSIDY_ENDPOINTS.BASE);
        return response.data.data;
    },

    createSubsidy: async (data) => { // Admin only
        const response = await api.post(SUBSIDY_ENDPOINTS.BASE, data);
        return response.data.data;
    }
};

export default financeService;
