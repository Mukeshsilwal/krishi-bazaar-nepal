import api from './api';

export const getLoans = async (userId: string) => {
    // Backend endpoint likely /finance/loans?userId=... or /finance/loans/my
    // Assuming /finance/loans/my based on other patterns or simply /finance/loans for current user
    // Web uses: financeService.getLoans(user.id)
    // If backend uses user context, we might not need ID. 
    // Let's assume /finance/loans/my for consistency with orders
    const response = await api.get(`/finance/loans/my`);
    return response.data.data || [];
};

export const getPolicies = async (userId: string) => {
    const response = await api.get(`/finance/insurance/my`);
    return response.data.data || [];
};

export const getAllSubsidies = async () => {
    const response = await api.get(`/finance/subsidies`);
    return response.data.data || [];
};
