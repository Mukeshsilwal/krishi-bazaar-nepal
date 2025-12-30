import api from '../../../services/api';

const marketPriceService = {
    // Get prices for specific crop and district
    // Markets
    getMarkets: async () => {
        const response = await api.get('/markets');
        return response.data;
    },

    createMarket: async (data) => {
        const response = await api.post('/markets', data);
        return response.data;
    },

    // Price Alerts
    createAlert: async (data) => {
        const response = await api.post('/price-alerts', data);
        return response.data;
    },

    getUserAlerts: async (userId) => {
        const response = await api.get(`/price-alerts?userId=${userId}`);
        return response.data;
    },

    deleteAlert: async (id) => {
        await api.delete(`/price-alerts/${id}`);
    },

    getPrices: async (cropName, district) => {
        const response = await api.get('/market-prices', {
            params: { cropName, district },
        });
        return response.data;
    },

    // Get latest price for crop in district
    getLatestPrice: async (cropName, district) => {
        const response = await api.get('/market-prices/latest', {
            params: { cropName, district },
        });
        return response.data;
    },

    // Get today's prices
    getTodaysPrices: async () => {
        const response = await api.get('/market-prices/today');
        return response.data;
    },

    // Get prices by date
    getPricesByDate: async (date) => {
        const response = await api.get(`/market-prices/date/${date}`);
        return response.data;
    },

    // Get available crops
    getAvailableCrops: async () => {
        const response = await api.get('/market-prices/crops');
        return response.data;
    },

    // Get available districts
    getAvailableDistricts: async () => {
        const response = await api.get('/market-prices/districts');
        return response.data;
    },

    // Add new price (admin only)
    addPrice: async (priceData) => {
        const response = await api.post('/market-prices', priceData);
        return response.data;
    },
};

export default marketPriceService;
