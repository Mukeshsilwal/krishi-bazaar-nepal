import api from '../../../services/api';
import { ORDER_ENDPOINTS } from '../../../config/endpoints';

const orderService = {
    // Create new order
    createOrder: async (orderData) => {
        const response = await api.post(ORDER_ENDPOINTS.ORDERS, orderData);
        return response.data;
    },

    // Get order by ID
    getOrder: async (id) => {
        const response = await api.get(ORDER_ENDPOINTS.ORDER_BY_ID(id));
        return response.data;
    },

    // Get my orders
    getMyOrders: async (role = null, page = 0, size = 20) => {
        const params = { page, size };
        if (role) {
            params.role = role;
        }
        const response = await api.get(ORDER_ENDPOINTS.MY_ORDERS, { params });
        return response.data;
    },

    // Update order status
    updateOrderStatus: async (id, statusData) => {
        const response = await api.put(ORDER_ENDPOINTS.UPDATE_STATUS(id), statusData);
        return response.data;
    },

    // Cancel order
    cancelOrder: async (id) => {
        const response = await api.delete(ORDER_ENDPOINTS.ORDER_BY_ID(id));
        return response.data;
    },
};

export default orderService;
