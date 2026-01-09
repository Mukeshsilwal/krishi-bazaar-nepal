import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import marketPriceService from '../services/marketPriceService';
import { TrendingUp, TrendingDown, Minus, Calculator, Bell, Loader2 } from 'lucide-react';
import PriceAlerts from '../../../components/PriceAlerts';
import SearchBar from '../components/SearchBar';
import { useLanguage } from '../../../context/LanguageContext';

// Format source name for display
const formatSource = (source: string) => {
    if (!source) return 'Unknown';
    if (source === 'RAMROPATRO_SCRAPER') return 'RamroPatro';
    if (source === 'GOV_API') return 'Kalimati Market';
    return source.replace('_', ' ');
};

const MarketPriceDashboard = () => {
    const { t } = useLanguage();
    const [prices, setPrices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState('Kathmandu');
    const [selectedCrop, setSelectedCrop] = useState('');
    const [priceHistory, setPriceHistory] = useState([]);

    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [availableCrops, setAvailableCrops] = useState<string[]>([]);

    // Pagination state
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef(null);

    // Fetch available crops for search suggestions
    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const data = await marketPriceService.getAvailableCrops();
                // Ensure data is array of strings
                if (Array.isArray(data)) setAvailableCrops(data);
            } catch (err) {
                console.error("Failed to fetch crop suggestions", err);
            }
        };
        fetchCrops();
    }, []);

    const handleSearch = (e: React.FormEvent | string) => {
        if (typeof e !== 'string') e?.preventDefault();
        const term = typeof e === 'string' ? e : searchTerm;

        setSearchTerm(term);
        // If we select a term, we filter the list AND show history
        if (term) {
            setSelectedCrop(term);
        }

        // Trigger backend search
        setPage(0);
        setHasMore(true);
        setLoading(true);
        loadPrices(0, true, term);
    };

    // Initial load when district changes
    useEffect(() => {
        setPrices([]);
        setPage(0);
        setHasMore(true);
        setLoading(true);
        loadPrices(0, true);
    }, [selectedDistrict]);

    // Infinite scroll observer
    const handleObserver = useCallback((entries: any) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading && !loadingMore) {
            setPage((prev) => prev + 1);
        }
    }, [hasMore, loading, loadingMore]);

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: "20px",
            threshold: 1.0
        });
        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => {
            if (loaderRef.current) observer.unobserve(loaderRef.current);
        };
    }, [handleObserver]);

    // Load next page
    useEffect(() => {
        if (page > 0) {
            loadPrices(page, false, searchTerm);
        }
    }, [page]);

    const loadPrices = async (pageNum: number, isReset: boolean, search: string = searchTerm) => {
        if (!isReset) setLoadingMore(true);
        try {
            // Pass searchTerm to service
            const data = await marketPriceService.getTodaysPrices(selectedDistrict, search, pageNum, 20);

            // Handle paginated response structure if available, otherwise assume list
            const newPrices = data.content ? data.content : (Array.isArray(data) ? data : []);
            const isLast = data.last !== undefined ? data.last : (newPrices.length < 20);

            if (isReset) {
                setPrices(newPrices);
                // Always select the first crop on a fresh load/search to ensure Trend shows valid data
                if (newPrices.length > 0) {
                    setSelectedCrop(newPrices[0].cropName);
                } else {
                    setSelectedCrop('');
                }
            } else {
                setPrices(prev => [...prev, ...newPrices]);
            }

            setHasMore(!isLast);
            setLoading(false);
            setLoadingMore(false);
        } catch (error) {
            console.error("Error loading prices", error);
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (selectedCrop) {
            loadHistory();
        }
    }, [selectedCrop, selectedDistrict]);

    const loadHistory = async () => {
        try {
            const data = await marketPriceService.getPriceHistory(selectedCrop, selectedDistrict);
            const formatted = data.map((p: any) => ({
                date: p.priceDate,
                price: p.avgPrice
            })).reverse();
            setPriceHistory(formatted);
        } catch (error) {
            console.error("Error loading history", error);
        }
    };

    return (
        <div className="bg-gray-50 min-h-full">
            {/* Hero Search Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        {t('market.hero.title')}
                    </h1>
                    <p className="text-green-100 text-lg mb-8">
                        {t('market.hero.subtitle')}
                    </p>

                    <div className="max-w-2xl mx-auto">
                        <SearchBar
                            value={searchTerm}
                            onChange={(val) => { setSearchTerm(val); if (!val) setSelectedCrop(''); }}
                            onSearch={handleSearch}
                            suggestions={availableCrops}
                            placeholder={t('market.search.placeholder')}
                            className="w-full text-lg shadow-lg"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Price List */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Filters */}
                        <div className="bg-white p-4 rounded-lg shadow-sm flex gap-4">
                            <label className="flex items-center gap-2 text-gray-700 font-medium">
                                {t('market.filter.district')}
                            </label>
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                            >
                                <option value="Kathmandu">Kathmandu</option>
                                <option value="Chitwan">Chitwan</option>
                                <option value="Pokhara">Pokhara</option>
                                <option value="Jhapa">Jhapa</option>
                            </select>
                        </div>

                        {/* Price Table */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden min-h-[400px]">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {t('market.table.title')} - {selectedDistrict}
                                    {prices.length > 0 && (
                                        <span className="ml-2 text-sm font-normal text-gray-500">
                                            ({new Date(prices[0].priceDate).toLocaleDateString()})
                                        </span>
                                    )}
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                {!loading && prices.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">{t('market.empty')} {selectedDistrict}.</div>
                                ) : (
                                    <>
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('market.table.commodity')}</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('market.table.unit')}</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('market.table.min')}</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('market.table.max')}</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('market.table.avg')}</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('market.table.source')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {prices.map((item: any) => (
                                                    <tr
                                                        key={`${item.id}-${item.cropName}`}
                                                        onClick={() => setSelectedCrop(item.cropName)}
                                                        className={`hover:bg-gray-50 cursor-pointer ${selectedCrop === item.cropName ? 'bg-green-50' : ''}`}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.cropName}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rs. {item.minPrice}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rs. {item.maxPrice}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">Rs. {item.avgPrice}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                                                {formatSource(item.source)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {/* Sentinel for infinite scroll */}
                                        <div ref={loaderRef} className="h-10 w-full flex items-center justify-center p-4">
                                            {(loading || loadingMore) && (
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    {t('market.loading')}
                                                </div>
                                            )}
                                            {!hasMore && prices.length > 0 && (
                                                <span className="text-xs text-gray-400">{t('market.end')}</span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Trend Chart */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('market.trend.title')}: {selectedCrop || t('market.trend.select')}</h3>
                            {priceHistory.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={priceHistory}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={2} name="Avg Price" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-gray-400">
                                    {selectedCrop ? t('market.trend.noData') : t('market.trend.select')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Price Alerts Component */}
                        <PriceAlerts />

                        {/* Market Summary/Tips */}
                        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                            <h3 className="font-semibold text-green-800 mb-2">{t('market.tips.title')}</h3>
                            <ul className="text-sm text-green-700 space-y-2">
                                <li>{t('market.tips.1')}</li>
                                <li>{t('market.tips.2')}</li>
                                <li>{t('market.tips.3')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketPriceDashboard;
