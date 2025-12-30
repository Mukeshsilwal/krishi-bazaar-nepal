import api from './api';

const orderService = {
    // Create new order
    createOrder: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    // Get order by ID
    getOrder: async (id) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    // Get my orders
    getMyOrders: async (role = null, page = 0, size = 20) => {
        const params = { page, size };
        if (role) {
            params.role = role;
        }
        const response = await api.get('/orders/my', { params });
        return response.data;
    },

    // Update order status
    updateOrderStatus: async (id, statusData) => {
        const response = await api.put(`/orders/${id}/status`, statusData);
        return response.data;
    },

    // Cancel order
    cancelOrder: async (id) => {
        const response = await api.delete(`/orders/${id}`);
        return response.data;
    },
};

export default orderService;
