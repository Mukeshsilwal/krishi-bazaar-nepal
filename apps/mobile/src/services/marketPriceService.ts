import api from './api';

export interface MarketPrice {
    id: string;
    commodityCode: string; // Crop Name
    district: string;
    marketName: string;
    wholesalePrice: number;
    retailPrice: number;
    priceDate: string;
    unit: string;
}

export const getTodaysPrices = async (page = 0, size = 10, district = '', cropName = '') => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        paginated: 'true'
    });
    if (district) params.append('district', district);
    if (cropName) params.append('cropName', cropName);

    const response = await api.get(`/market-prices/today?${params.toString()}`);
    return response.data; // Expecting Page<MarketPriceDto>
};

export const getAvailableCrops = async () => {
    const response = await api.get('/market-prices/crops');
    return response.data.data;
};

export const getAvailableDistricts = async () => {
    const response = await api.get('/market-prices/districts');
    return response.data.data;
};
