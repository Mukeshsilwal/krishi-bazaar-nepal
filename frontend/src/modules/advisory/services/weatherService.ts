import api from '../../../services/api';
import { WEATHER_ENDPOINTS } from '../../../config/endpoints';

export interface WeatherData {
    location: string;
    district: string;
    temperature: number;
    minTemperature: number;
    maxTemperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: string;
    cloudCoverage: number;
    condition: string;
    description: string;
    rainfall: number;
    forecastTime?: string;
    timestamp: string;
    dataSource: string;
}

const weatherService = {
    getCurrentWeather: async (district: string) => {
        const response = await api.get<WeatherData>(`${WEATHER_ENDPOINTS.CURRENT}/${district}`);
        return response.data;
    },

    getForecast: async (district: string, hours = 48) => {
        const response = await api.get<WeatherData[]>(`${WEATHER_ENDPOINTS.FORECAST}/${district}`, {
            params: { hours }
        });
        return response.data;
    }
};

export default weatherService;
