// @ts-ignore
import api from '../../../services/api.js';
// @ts-ignore
import { MARKET_PRICE_ENDPOINTS, MARKET_ENDPOINTS, PRICE_ALERT_ENDPOINTS } from '../../../config/endpoints.js';

const marketPriceService = {
    // Markets
    getMarkets: async () => {
        const response = await api.get(MARKET_ENDPOINTS.BASE);
        return response.data;
    },

    createMarket: async (data: any) => {
        const response = await api.post(MARKET_ENDPOINTS.BASE, data);
        return response.data;
    },

    getMarketById: async (id: string) => {
        const response = await api.get(MARKET_ENDPOINTS.BY_ID(id));
        return response.data;
    },

    // Market Prices
    getTodaysPrices: async (district?: string, cropName?: string, page = 0, size = 20) => {
        const response = await api.get(MARKET_PRICE_ENDPOINTS.TODAY, {
            params: { district, cropName, page, size, paginated: true }
        });
        return response.data.data || response.data;
    },

    getLatestPrice: async (cropName: string, district: string) => {
        const response = await api.get(MARKET_PRICE_ENDPOINTS.LATEST, {
            params: { cropName, district }
        });
        return response.data.data || response.data;
    },

    getPriceHistory: async (cropName: string, district: string) => {
        const response = await api.get(MARKET_PRICE_ENDPOINTS.HISTORY, {
            params: { cropName, district }
        });
        return response.data.data || response.data;
    },

    getAnalytics: async () => {
        const response = await api.get(MARKET_PRICE_ENDPOINTS.ANALYTICS);
        return response.data.data || response.data;
    },

    getAvailableCrops: async () => {
        const response = await api.get(MARKET_PRICE_ENDPOINTS.CROPS);
        return response.data.data || response.data;
    },

    getAvailableDistricts: async () => {
        const response = await api.get(MARKET_PRICE_ENDPOINTS.DISTRICTS);
        return response.data.data || response.data;
    },

    getPricesByDate: async (date: string) => {
        const response = await api.get(MARKET_PRICE_ENDPOINTS.BY_DATE(date));
        return response.data.data || response.data;
    },

    addPrice: async (priceData: any) => {
        const response = await api.post(MARKET_PRICE_ENDPOINTS.BASE, priceData);
        return response.data.data || response.data;
    },

    // Price Alerts
    getUserAlerts: async (userId: string) => {
        // Backend expects: GET /api/price-alerts?userId=...
        const response = await api.get(PRICE_ALERT_ENDPOINTS.BASE, {
            params: { userId }
        });
        return response.data.data || response.data;
    },

    createAlert: async (alertData: any) => {
        const response = await api.post(PRICE_ALERT_ENDPOINTS.BASE, alertData);
        return response.data.data || response.data;
    },

    deleteAlert: async (alertId: string) => {
        const response = await api.delete(PRICE_ALERT_ENDPOINTS.BY_ID(alertId));
        return response.data;
    },

    overridePrice: async (priceData: any) => {
        const response = await api.post(MARKET_PRICE_ENDPOINTS.OVERRIDE, priceData);
        return response.data.data || response.data;
    }
};

export default marketPriceService;
