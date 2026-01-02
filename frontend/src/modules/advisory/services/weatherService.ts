import api from '../../../services/api';

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
        const response = await api.get<WeatherData>(`/weather/current/${district}`);
        return response.data;
    },

    getForecast: async (district: string, hours = 48) => {
        const response = await api.get<WeatherData[]>(`/weather/forecast/${district}`, {
            params: { hours }
        });
        return response.data;
    }
};

export default weatherService;
