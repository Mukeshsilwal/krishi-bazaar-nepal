import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import weatherService, { WeatherData } from '@/modules/advisory/services/weatherService';
import { Cloud, Droplets, Wind, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';


const WeatherCard = () => {
    const { language } = useLanguage();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [district] = useState('Kathmandu'); // Could be dynamic based on user profile in future

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const data = await weatherService.getCurrentWeather(district);
                setWeather(data);
            } catch (error) {
                console.error("Failed to fetch weather", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [district]);

    if (loading) return (
        <div className="bg-blue-600 rounded-3xl p-6 text-white h-[200px] animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!weather) return null;

    const today = new Date();
    const dateFormatted = language === 'ne'
        ? new Intl.DateTimeFormat('ne-NP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(today)
        : format(today, 'EEEE, d MMMM');

    return (
        <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden h-full">
            {/* Background Pattern */}
            <div className="absolute top-[-20px] right-[-20px] opacity-10">
                <Cloud size={150} />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-1.5 text-blue-100 text-sm font-medium mb-1">
                            <MapPin size={14} />
                            <span>{weather.location}</span>
                        </div>
                        <h3 className="text-3xl font-bold">{Math.round(weather.temperature)}°</h3>
                        <p className="text-blue-100 text-sm capitalize">{weather.description}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                        <Cloud size={32} className="text-white" />
                    </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1 opacity-80">
                            <Droplets size={14} />
                            <span className="text-xs">{language === 'ne' ? 'आर्द्रता' : 'Humidity'}</span>
                        </div>
                        <span className="font-semibold text-sm">{weather.humidity}%</span>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1 opacity-80">
                            <Wind size={14} />
                            <span className="text-xs">{language === 'ne' ? 'हावा' : 'Wind'}</span>
                        </div>
                        <span className="font-semibold text-sm">{Math.round(weather.windSpeed)} km/h</span>
                    </div>
                </div>

                {/* Footer Date */}
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-blue-100">
                    <Calendar size={12} />
                    <span>{dateFormatted}</span>
                </div>
            </div>
        </div>
    );
};

export default WeatherCard;
