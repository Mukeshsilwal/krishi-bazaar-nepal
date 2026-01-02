import api from '../../../services/api';
import { MARKET_ENDPOINTS, PRICE_ALERT_ENDPOINTS, MARKET_PRICE_ENDPOINTS } from '../../../config/endpoints';

const marketPriceService = {
    // Get prices for specific crop and district
    // Markets
    getMarkets: async () => {
        const response = await api.get(MARKET_ENDPOINTS.BASE);
        return response.data;
    },

    createMarket: async (data) => {
        const response = await api.post(MARKET_ENDPOINTS.BASE, data);
        return response.data;
    },

    // Get market by ID
    getMarketById: async (id) => {
        const response = await api.get(MARKET_ENDPOINTS.BY_ID(id));
        return response.data;
    },

    // Price Alerts
    createAlert: async (data) => {
        const response = await api.post(PRICE_ALERT_ENDPOINTS.BASE, data);
        return response.data;
    },

    getUserAlerts: async (userId) => {
        const response = await api.get(`${PRICE_ALERT_ENDPOINTS.BASE}?userId=${userId}`);
        return response.data;
    },

    deleteAlert: async (id) => {
        await api.delete(PRICE_ALERT_ENDPOINTS.BY_ID(id));
    },

    getPrices: async (cropName, district) => {
        const response = await api.get(MARKET_PRICE_ENDPOINTS.BASE, {
            params: { cropName, district },
        });
        return response.data;
    },

    // Get latest price for crop in district
    getLatestPrice: async (cropName, district) => {
        const response = await api.get(MARKET_PRICE_ENDPOINTS.LATEST, {
            params: { cropName, district },
        });
        return response.data;
    },

    // Get today's market prices
    getTodayPrices: async (district = null, crop = null) => {
        const response = await api.get(MARKET_PRICE_ENDPOINTS.TODAY, {
            params: { district, crop }
        });
        return response.data;
    },

    // Get prices by date
    getPricesByDate: async (date) => {
        const response = await api.get(MARKET_PRICE_ENDPOINTS.BY_DATE(date));
        return response.data;
    },

    // Get available crops
    getAvailableCrops: async () => {
        const response = await api.get(MARKET_PRICE_ENDPOINTS.CROPS);
        return response.data;
    },

    // Get available districts
    getAvailableDistricts: async () => {
        const response = await api.get(MARKET_PRICE_ENDPOINTS.DISTRICTS);
        return response.data;
    },

    // Add new price (admin only)
    addPrice: async (priceData) => {
        const response = await api.post(MARKET_PRICE_ENDPOINTS.BASE, priceData);
        return response.data;
    },
};

export default marketPriceService;
