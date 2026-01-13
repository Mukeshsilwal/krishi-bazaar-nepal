import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowUp, ArrowDown, Minus, Filter } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useMarketPrices } from '@/hooks/useMarketPrices';
import { Link } from 'react-router-dom';

const MarketStats = () => {
    const { language } = useLanguage();
    const { data: prices, isLoading, error } = useMarketPrices();

    // Helper to render trend
    const renderTrend = (trendValue: number | undefined) => {
        if (trendValue === undefined || trendValue === null) return <span className="text-gray-400 text-xs">-</span>;
        if (trendValue === 0) return <span className="text-gray-400 flex items-center text-xs"><Minus size={14} className="mr-1" /> 0%</span>;
        if (trendValue > 0) return <span className="text-green-600 flex items-center text-xs"><ArrowUp size={14} className="mr-1" /> {trendValue}%</span>;
        return <span className="text-red-500 flex items-center text-xs"><ArrowDown size={14} className="mr-1" /> {Math.abs(trendValue)}%</span>;
    };

    if (isLoading) return <div className="p-8 flex justify-center"><LoadingSpinner /></div>;

    // Graceful error handling in UI
    if (error) return (
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl">
            <p>{language === 'ne' ? 'बजार मूल्य लोड गर्न असफल भयो' : 'Failed to load market prices.'}</p>
        </div>
    );

    const displayPrices = Array.isArray(prices) ? prices.slice(0, 5) : [];

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
                        {displayPrices.length > 0 ? (
                            displayPrices.map((item: any, index: number) => {
                                // Fallback image if backend doesn't send one (though backend logic handles it)
                                const imageUrl = item.imageUrl || 'https://images.unsplash.com/photo-1595855709915-f65b907afa0a?w=500&auto=format&fit=crop&q=60';

                                return (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 pl-2">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3 overflow-hidden shadow-sm border border-gray-100">
                                                    <img
                                                        src={imageUrl}
                                                        alt={item.commodityName || 'Crop'}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
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
