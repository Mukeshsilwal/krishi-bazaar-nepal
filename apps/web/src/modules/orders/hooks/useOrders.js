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

            if (response.code === 0 && response.data) {
                // Response structure: { code, message, data: { content: [...] } }
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
            if (response.code === 0) {
                await fetchOrders();
                return { code: 0, data: response.data };
            }
            return { code: 'ERROR', message: response.message };
        } catch (err) {
            return {
                code: 'ERROR',
                message: err.response?.data?.message || 'Failed to create order',
            };
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            setLoading(true);
            const response = await orderService.updateOrderStatus(orderId, status);
            if (response.code === 0) {
                await fetchOrders();
                return response;
            }
            return response;
        } catch (err) {
            setError(err.message || 'Failed to update order');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const placeOrder = async (orderData) => {
        try {
            setLoading(true);
            const response = await orderService.placeOrder(orderData);
            if (response.code === 0) {
                await fetchOrders();
                return response;
            }
            return response;
        } catch (err) {
            setError(err.message || 'Failed to place order');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const cancelOrder = async (orderId) => {
        try {
            const response = await orderService.cancelOrder(orderId);
            if (response.code === 0) {
                await fetchOrders();
                return { code: 0 };
            }
            return { code: 'ERROR', message: response.message };
        } catch (err) {
            return {
                code: 'ERROR',
                message: err.response?.data?.message || 'Failed to cancel order',
            };
        }
    };

    return {
        orders,
        loading,
        error,
        createOrder,
        updateOrderStatus,
        placeOrder,
        cancelOrder,
        refresh: fetchOrders,
    };
};
