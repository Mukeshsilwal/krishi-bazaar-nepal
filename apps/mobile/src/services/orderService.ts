import api from './api';

export const getOrders = async () => {
    // Return all orders (or paginated)
    const response = await api.get('/orders/my');
    return response.data; // Assuming comes as List<OrderDto> or inside 'data'
};

export const getOrderDetails = async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
};
