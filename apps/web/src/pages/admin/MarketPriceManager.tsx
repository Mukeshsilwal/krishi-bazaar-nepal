import React, { useState, useEffect } from 'react';
import marketPriceService from '../../modules/marketplace/services/marketPriceService';
import { Plus, Search, Check, AlertCircle } from 'lucide-react';

const MarketPriceManager = () => {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        cropName: '',
        district: 'Kathmandu',
        minPrice: '',
        maxPrice: '',
        avgPrice: '',
        unit: 'Kg',
        source: 'Manual Override'
    });
    const [searchDistrict, setSearchDistrict] = useState('Kathmandu');

    useEffect(() => {
        loadPrices();
    }, [searchDistrict]);

    const loadPrices = async () => {
        setLoading(true);
        try {
            // Fetch with specific district and large page size for admin view
            const data = await marketPriceService.getTodaysPrices(searchDistrict, '', 0, 500);
            const items = Array.isArray(data) ? data : (data.content || []);
            // Backend already filters by district if provided, but we can trust it.
            setPrices(items);
        } catch (error) {
            console.error("Error loading prices", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCalculateAvg = () => {
        const min = parseFloat(formData.minPrice) || 0;
        const max = parseFloat(formData.maxPrice) || 0;
        if (min && max) {
            setFormData(prev => ({ ...prev, avgPrice: ((min + max) / 2).toFixed(2) }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await marketPriceService.addPrice({
                ...formData,
                minPrice: parseFloat(formData.minPrice),
                maxPrice: parseFloat(formData.maxPrice),
                avgPrice: parseFloat(formData.avgPrice)
            });
            setShowAddForm(false);
            setFormData({
                cropName: '',
                district: 'Kathmandu',
                minPrice: '',
                maxPrice: '',
                avgPrice: '',
                unit: 'Kg',
                source: 'Manual Override'
            });
            alert('Price updated successfully');
            loadPrices();
        } catch (error) {
            console.error("Error adding price", error);
            alert('Failed to update price');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Market Price Management</h1>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                    <Plus className="w-4 h-4" />
                    Add / Override Price
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by District</label>
                <select
                    value={searchDistrict}
                    onChange={(e) => setSearchDistrict(e.target.value)}
                    className="w-full md:w-64 border rounded-md p-2"
                >
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Chitwan">Chitwan</option>
                    <option value="Pokhara">Pokhara</option>
                    <option value="Jhapa">Jhapa</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {prices.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">No records found</td>
                                </tr>
                            ) : (
                                prices.map((price: any) => {
                                    // Backend now provides imageUrl
                                    const imageUrl = price.imageUrl || 'https://images.unsplash.com/photo-1595855709915-f65b907afa0a?w=500&auto=format&fit=crop&q=60';
                                    return (
                                        <tr key={price.id}>
                                            <td className="px-6 py-4">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                                                    <img
                                                        src={imageUrl}
                                                        alt={price.cropName}
                                                        className="h-full w-full object-cover"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{price.cropName}</td>
                                            <td className="px-6 py-4">{price.district}</td>
                                            <td className="px-6 py-4">{price.minPrice}</td>
                                            <td className="px-6 py-4">{price.maxPrice}</td>
                                            <td className="px-6 py-4 font-bold text-green-600">{price.avgPrice}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{price.source}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{price.priceDate}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Add / Override Price</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Crop Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border rounded p-2"
                                        value={formData.cropName}
                                        onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                                        placeholder="e.g. Tomato Big"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">District</label>
                                    <select
                                        className="w-full border rounded p-2"
                                        value={formData.district}
                                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    >
                                        <option value="Kathmandu">Kathmandu</option>
                                        <option value="Chitwan">Chitwan</option>
                                        <option value="Pokhara">Pokhara</option>
                                        <option value="Jhapa">Jhapa</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Min Price</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full border rounded p-2"
                                        value={formData.minPrice}
                                        onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                                        onBlur={handleCalculateAvg}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Max Price</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full border rounded p-2"
                                        value={formData.maxPrice}
                                        onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                                        onBlur={handleCalculateAvg}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Avg Price</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full border rounded p-2"
                                        value={formData.avgPrice}
                                        onChange={(e) => setFormData({ ...formData, avgPrice: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Save Price
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketPriceManager;
