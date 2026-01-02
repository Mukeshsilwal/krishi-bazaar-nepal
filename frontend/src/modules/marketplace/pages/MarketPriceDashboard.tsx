import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import marketPriceService from '../services/marketPriceService';
import { TrendingUp, TrendingDown, Minus, Calculator, Bell } from 'lucide-react';
import PriceAlerts from '../../../components/PriceAlerts';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const MarketPriceDashboard = () => {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDistrict, setSelectedDistrict] = useState('Kathmandu');
    const [selectedCrop, setSelectedCrop] = useState('Tomato Big');
    const [priceHistory, setPriceHistory] = useState([]);

    useEffect(() => {
        loadPrices();
    }, [selectedDistrict]);

    useEffect(() => {
        loadHistory();
    }, [selectedCrop, selectedDistrict]);

    const loadPrices = async () => {
        try {
            const data = await marketPriceService.getDailyPrices(selectedDistrict);
            setPrices(data);
            setLoading(false);
        } catch (error) {
            console.error("Error loading prices", error);
            setLoading(false);
        }
    };

    const loadHistory = async () => {
        try {
            // Mock history data since backend implementation of history might be limited
            // In a real app, call: await marketPriceService.getPriceHistory(selectedCrop, selectedDistrict);
            const mockHistory = [
                { date: '2023-01-01', price: 45 },
                { date: '2023-01-02', price: 48 },
                { date: '2023-01-03', price: 46 },
                { date: '2023-01-04', price: 50 },
                { date: '2023-01-05', price: 52 },
                { date: '2023-01-06', price: 51 },
                { date: '2023-01-07', price: 55 },
            ];
            setPriceHistory(mockHistory);
        } catch (error) {
            console.error("Error loading history", error);
        }
    };

    const chartData = {
        labels: priceHistory.map(h => h.date),
        datasets: [
            {
                label: `Price Trend: ${selectedCrop}`,
                data: priceHistory.map(h => h.price),
                borderColor: 'rgb(22, 163, 74)',
                backgroundColor: 'rgba(22, 163, 74, 0.5)',
            },
        ],
    };

    return (
        <div className="bg-gray-50 min-h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Market Intelligence</h1>
                    <p className="mt-2 text-gray-600">Real-time agricultural commodity prices and trends</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Price List */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Filters */}
                        <div className="bg-white p-4 rounded-lg shadow-sm flex gap-4">
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                            >
                                <option value="Kathmandu">Kathmandu</option>
                                <option value="Chitwan">Chitwan</option>
                                <option value="Pokhara">Pokhara</option>
                                <option value="Jhapa">Jhapa</option>
                            </select>
                        </div>

                        {/* Price Table */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Daily Rates</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commodity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {prices.map((item: any, index) => (
                                            <tr
                                                key={index}
                                                onClick={() => setSelectedCrop(item.commodity)}
                                                className="hover:bg-gray-50 cursor-pointer"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.commodity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rs. {item.minPrice}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rs. {item.maxPrice}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">Rs. {item.avgPrice}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Trend Chart */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Trend: {selectedCrop}</h3>
                            <Line data={chartData} />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Price Alerts Component */}
                        <PriceAlerts />

                        {/* Market Summary/Tips */}
                        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                            <h3 className="font-semibold text-green-800 mb-2">Market Tips</h3>
                            <ul className="text-sm text-green-700 space-y-2">
                                <li>• Prices are updated daily at 8:00 AM.</li>
                                <li>• Wholesale prices usually exclude VAT.</li>
                                <li>• Transport costs may vary by location.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketPriceDashboard;
