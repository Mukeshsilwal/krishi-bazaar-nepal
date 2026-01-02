import api from './api';
import { PAYMENT_ENDPOINTS } from '../config/endpoints';

const paymentService = {
    // Initiate payment
    initiatePayment: async (paymentData) => {
        const response = await api.post(PAYMENT_ENDPOINTS.INITIATE, paymentData);
        return response.data;
    },

    // Verify payment
    verifyPayment: async (transactionId, gatewayTransactionId) => {
        const response = await api.post(PAYMENT_ENDPOINTS.VERIFY, null, {
            params: { transactionId, gatewayTransactionId },
        });
        return response.data;
    },

    // Get transaction details
    getTransaction: async (id) => {
        const response = await api.get(PAYMENT_ENDPOINTS.BY_ID(id));
        return response.data;
    },
};

export default paymentService;
