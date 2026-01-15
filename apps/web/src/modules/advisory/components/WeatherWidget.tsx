import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import weatherService, { WeatherData } from '../services/weatherService';
import { Cloud, Droplets, Wind, Thermometer, MapPin } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const WeatherWidget = () => {
    const { language } = useLanguage();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [district, setDistrict] = useState('Kathmandu'); // Default

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const data = await weatherService.getCurrentWeather(district);
                setWeather(data);
                setError(null);
            } catch (error) {
                console.error("Failed to fetch weather", error);
                setError("Failed to load weather data");
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [district]);

    if (loading) return <div className="p-4 flex justify-center"><LoadingSpinner /></div>;

    if (error || !weather) {
        return (
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="bg-gray-100 rounded-3xl p-8 text-center max-w-4xl mx-auto border border-gray-200">
                        <p className="text-gray-500 mb-2">
                            {language === 'ne' ? 'मौसम जानकारी लोड गर्न सकिएन' : 'Could not load weather data'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-blue-600 hover:underline text-sm"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-8 text-white shadow-xl max-w-4xl mx-auto overflow-hidden relative">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
                        <Cloud size={200} />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-blue-100">
                                <MapPin size={18} />
                                <span className="text-lg font-medium">{weather.location} ({weather.district})</span>
                            </div>
                            <h2 className="text-5xl font-bold mb-4 flex items-center gap-4">
                                {Math.round(weather.temperature)}°C
                                <span className="text-xl font-normal opacity-80 capitalize">{weather.description}</span>
                            </h2>
                            <p className="text-blue-100">
                                {language === 'ne' ? 'महसुस हुन्छ' : 'Feels like'} {Math.round(weather.feelsLike)}°C
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-6 w-full md:w-auto">
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-center">
                                <Droplets className="mx-auto mb-2 opacity-80" size={24} />
                                <div className="font-bold text-lg">{weather.humidity}%</div>
                                <div className="text-xs opacity-70">{language === 'ne' ? 'आर्द्रता' : 'Humidity'}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-center">
                                <Wind className="mx-auto mb-2 opacity-80" size={24} />
                                <div className="font-bold text-lg">{Math.round(weather.windSpeed)} <span className="text-xs">km/h</span></div>
                                <div className="text-xs opacity-70">{language === 'ne' ? 'हावा' : 'Wind'}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-center">
                                <Thermometer className="mx-auto mb-2 opacity-80" size={24} />
                                <div className="font-bold text-lg">{Math.round(weather.maxTemperature)}°</div>
                                <div className="text-xs opacity-70">{language === 'ne' ? 'उच्चतम' : 'High'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WeatherWidget;
