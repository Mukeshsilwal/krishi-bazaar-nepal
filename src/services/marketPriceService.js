import api from './api';

const marketPriceService = {
    // Get prices for specific crop and district
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
