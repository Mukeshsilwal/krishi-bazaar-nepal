/**
 * WeatherAdvisory - Visual-first weather page for rural users
 * Features: Large icons, color-coded alerts, simple action cards
 */

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { icons, priorityColors } from '@/constants/icons';
import BottomNav from '@/components/navigation/BottomNav';
import { toast } from 'sonner';

interface WeatherData {
    temperature: number;
    humidity: number;
    rainfall: number;
    condition: 'sunny' | 'cloudy' | 'rainy';
    alert?: {
        level: 'critical' | 'high' | 'medium' | 'low';
        message: string;
        action: string;
    };
}

const WeatherAdvisory = () => {
    const { t, language } = useLanguage();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Fetch from actual API
        // Mock data for demonstration
        setTimeout(() => {
            setWeather({
                temperature: 28,
                humidity: 75,
                rainfall: 20,
                condition: 'rainy',
                alert: {
                    level: 'critical',
                    message: language === 'ne' ? 'आज धेरै वर्षा हुने सम्भावना छ' : 'Heavy rainfall expected today',
                    action: language === 'ne' ? 'धान खेतमा पानी निकास गर्नुहोस्' : 'Drain water from rice fields'
                }
            });
            setLoading(false);
        }, 1000);
    }, [language]);

    const getWeatherIcon = () => {
        if (!weather) return icons.weather.cloudy;
        switch (weather.condition) {
            case 'sunny':
                return icons.weather.sunny;
            case 'rainy':
                return icons.weather.rainy;
            default:
                return icons.weather.cloudy;
        }
    };

    const getAlertColor = (level?: string) => {
        switch (level) {
            case 'critical':
                return priorityColors.critical;
            case 'high':
                return priorityColors.high;
            case 'medium':
                return priorityColors.medium;
            default:
                return priorityColors.low;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-soft pb-24">
                <div className="bg-gradient-hero text-white px-4 py-8">
                    <h1 className="text-2xl font-bold">{t('weather.title')}</h1>
                </div>
                <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
                    <div className="skeleton w-full h-64" />
                    <div className="skeleton w-full h-32" />
                </div>
                <BottomNav />
            </div>
        );
    }

    const WeatherIcon = getWeatherIcon();
    const alertColors = weather?.alert ? getAlertColor(weather.alert.level) : priorityColors.normal;

    return (
        <div className="min-h-screen bg-gradient-soft pb-24">
            {/* Header */}
            <div className="bg-gradient-hero text-white px-4 py-8">
                <h1 className="text-2xl font-bold mb-2">{t('weather.title')}</h1>
                <p className="text-lg opacity-90">{t('weather.today')}</p>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Main Weather Card */}
                <div className="bg-white rounded-2xl shadow-medium p-8 text-center">
                    <WeatherIcon className="w-32 h-32 mx-auto mb-6 text-blue-500" />
                    <div className="text-6xl font-bold text-gray-900 mb-2">
                        {weather?.temperature}°C
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-blue-50 rounded-xl p-4">
                            <icons.weather.humidity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <div className="text-readable text-gray-600">{t('weather.humidity')}</div>
                            <div className="text-xl font-bold text-gray-900">{weather?.humidity}%</div>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-4">
                            <icons.weather.rainy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <div className="text-readable text-gray-600">{t('weather.rainfall')}</div>
                            <div className="text-xl font-bold text-gray-900">{weather?.rainfall}mm</div>
                        </div>
                    </div>
                </div>

                {/* Alert Card */}
                {weather?.alert && (
                    <div className={`${alertColors.bg} border-2 ${alertColors.border} rounded-2xl p-6 shadow-medium`}>
                        <div className="flex items-start gap-4">
                            <icons.status.warning className={`w-12 h-12 ${alertColors.icon} flex-shrink-0`} />
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {weather.alert.message}
                                </h3>
                                <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <icons.actions.check className="w-5 h-5 text-green-600" />
                                        <span className="font-bold text-large-readable text-gray-900">
                                            {t('weather.whatToDo')}
                                        </span>
                                    </div>
                                    <p className="text-readable text-gray-700">
                                        {weather.alert.action}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-soft p-6">
                    <h3 className="font-bold text-xl mb-4">{language === 'ne' ? 'सुझाव' : 'Suggestions'}</h3>
                    <div className="space-y-3">
                        <button className="w-full touch-target-comfortable bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl px-6 py-4 text-left transition-all active:scale-95">
                            <div className="flex items-center gap-3">
                                <icons.crops.general className="w-6 h-6 text-green-600" />
                                <span className="text-large-readable font-medium text-gray-900">
                                    {language === 'ne' ? 'बाली सल्लाह हेर्नुहोस्' : 'View Crop Advisory'}
                                </span>
                            </div>
                        </button>
                        <button className="w-full touch-target-comfortable bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl px-6 py-4 text-left transition-all active:scale-95">
                            <div className="flex items-center gap-3">
                                <icons.time.history className="w-6 h-6 text-blue-600" />
                                <span className="text-large-readable font-medium text-gray-900">
                                    {language === 'ne' ? '७ दिनको मौसम' : '7-Day Forecast'}
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default WeatherAdvisory;
