import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import marketPriceService from '@/modules/marketplace/services/marketPriceService';
import { ArrowUp, ArrowDown, Minus, Filter } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getCropImage } from '@/config/cropAssets';
import { Link } from 'react-router-dom';

const MarketStats = () => {
    const { language } = useLanguage();
    const [prices, setPrices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                // Fetch today's prices
                const data = await marketPriceService.getTodaysPrices('Kathmandu', undefined, 0, 5);
                const priceList = data.content || data;
                setPrices(Array.isArray(priceList) ? priceList.slice(0, 5) : []);
            } catch (error) {
                console.error("Failed to fetch market prices", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrices();
    }, []);

    // Helper to render trend
    // Since backend might not return 'trend' yet, we show N/A or hiding it if it's 0 to avoid misinformation.
    // For now, if no trend data, we return null to keep UI clean.
    const renderTrend = (trendValue: number | undefined) => {
        if (trendValue === undefined || trendValue === null) return <span className="text-gray-400 text-xs">-</span>;
        if (trendValue === 0) return <span className="text-gray-400 flex items-center text-xs"><Minus size={14} className="mr-1" /> 0%</span>;
        if (trendValue > 0) return <span className="text-green-600 flex items-center text-xs"><ArrowUp size={14} className="mr-1" /> {trendValue}%</span>;
        return <span className="text-red-500 flex items-center text-xs"><ArrowDown size={14} className="mr-1" /> {Math.abs(trendValue)}%</span>;
    };

    if (loading) return <div className="p-8 flex justify-center"><LoadingSpinner /></div>;

    return (
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">
                    {language === 'ne' ? 'आजको तरकारी मूल्य' : "Today's Market Prices"}
                </h3>
                <Link to="/market-prices" className="text-sm font-medium text-green-600 flex items-center bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
                    <Filter size={14} className="mr-2" />
                    {language === 'ne' ? 'सबै हेर्नुहोस्' : 'View All'}
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 text-left">
                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider pl-2">
                                {language === 'ne' ? 'तरकारी' : 'Vegetable'}
                            </th>
                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {language === 'ne' ? 'न्यूनतम' : 'Min'}
                            </th>
                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {language === 'ne' ? 'अधिकतम' : 'Max'}
                            </th>
                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {language === 'ne' ? 'औसत' : 'Avg'}
                            </th>
                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right pr-2">
                                {language === 'ne' ? 'एकाइ' : 'Unit'}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {prices.length > 0 ? (
                            prices.map((item, index) => {
                                const cropName = item.commodityName || item.customCropName || 'unknown';
                                const imageUrl = getCropImage(cropName);

                                return (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 pl-2">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3 overflow-hidden shadow-sm border border-gray-100">
                                                    <img
                                                        src={imageUrl}
                                                        alt={cropName}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = getCropImage('default'); // Fallback
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 capitalize">
                                                        {language === 'ne' ? item.commodityNameNp || item.commodityName : item.commodityName}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm text-gray-600">Rs {item.minPrice}</td>
                                        <td className="py-4 text-sm text-gray-600">Rs {item.maxPrice}</td>
                                        <td className="py-4 text-sm font-semibold text-gray-900">Rs {item.avgPrice}</td>
                                        <td className="py-4 text-right pr-2 text-sm text-gray-500">
                                            {item.unit || 'Kg'}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-500">
                                    {language === 'ne' ? 'आजको लागि कुनै तथ्याङ्क उपलब्ध छैन' : 'No data available for today'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default MarketStats;
