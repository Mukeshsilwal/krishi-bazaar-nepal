import api from './api';

const paymentService = {
    // Initiate payment
    initiatePayment: async (paymentData) => {
        const response = await api.post('/payments/initiate', paymentData);
        return response.data;
    },

    // Verify payment
    verifyPayment: async (transactionId, gatewayTransactionId) => {
        const response = await api.post('/payments/verify', null, {
            params: { transactionId, gatewayTransactionId },
        });
        return response.data;
    },

    // Get transaction details
    getTransaction: async (id) => {
        const response = await api.get(`/payments/${id}`);
        return response.data;
    },
};

export default paymentService;
