import { useState, useEffect } from 'react';
import orderService from '../services/orderService';

export const useOrders = (role = null) => {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {

        try {
            setLoading(true);
            const response = await orderService.getMyOrders(role);

            if (response.success && response.data) {
                // Response structure: { success, message, data: { content: [...] } }
                const pageData = response.data;
                setOrders(Array.isArray(pageData) ? pageData : (pageData.content || []));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const createOrder = async (orderData) => {
        try {
            const response = await orderService.createOrder(orderData);
            if (response.success) {
                await fetchOrders();
                return { success: true, data: response.data };
            }
            return { success: false, message: response.message };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || 'Failed to create order',
            };
        }
    };

    const updateStatus = async (orderId, statusData) => {
        try {
            const response = await orderService.updateOrderStatus(orderId, statusData);
            if (response.success) {
                await fetchOrders();
                return { success: true, data: response.data };
            }
            return { success: false, message: response.message };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || 'Failed to update order',
            };
        }
    };

    const cancelOrder = async (orderId) => {
        try {
            const response = await orderService.cancelOrder(orderId);
            if (response.success) {
                await fetchOrders();
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || 'Failed to cancel order',
            };
        }
    };

    return {
        orders,
        loading,
        error,
        createOrder,
        updateStatus,
        cancelOrder,
        refresh: fetchOrders,
    };
};
