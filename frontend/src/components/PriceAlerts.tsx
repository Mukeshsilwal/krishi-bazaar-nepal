import React, { useState, useEffect } from 'react';
import marketPriceService from '../modules/marketplace/services/marketPriceService';
import { useAuth } from '../modules/auth/context/AuthContext';
import { Bell, Trash2, Plus } from 'lucide-react';

const PriceAlerts = () => {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        cropName: '',
        targetPrice: '',
        condition: 'BELOW'
    });

    useEffect(() => {
        if (user) {
            loadAlerts();
        }
    }, [user]);

    const loadAlerts = async () => {
        try {
            const data = await marketPriceService.getUserAlerts(user.id);
            setAlerts(data);
        } catch (error) {
            console.error('Failed to load alerts', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await marketPriceService.createAlert({
                userId: user.id,
                ...formData,
                targetPrice: parseFloat(formData.targetPrice)
            });
            setShowForm(false);
            setFormData({ cropName: '', targetPrice: '', condition: 'BELOW' });
            loadAlerts();
        } catch (error) {
            console.error('Failed to create alert', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await marketPriceService.deleteAlert(id);
                loadAlerts();
            } catch (error) {
                console.error('Failed to delete alert', error);
            }
        }
    };

    if (loading) return <div>Loading alerts...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Bell className="w-5 h-5 text-green-600" />
                    Price Alerts
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Create Alert
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
                            <input
                                type="text"
                                required
                                className="w-full p-2 border rounded-md"
                                value={formData.cropName}
                                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                                placeholder="e.g. Tomato"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Price (Rs)</label>
                            <input
                                type="number"
                                required
                                className="w-full p-2 border rounded-md"
                                value={formData.targetPrice}
                                onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={formData.condition}
                                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                            >
                                <option value="BELOW">Below Price</option>
                                <option value="ABOVE">Above Price</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                            Set Alert
                        </button>
                    </div>
                </form>
            )}

            {alerts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active alerts</p>
            ) : (
                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                            <div>
                                <p className="font-medium">{alert.cropName}</p>
                                <p className="text-sm text-gray-600">
                                    Notify when {alert.condition.toLowerCase()} Rs. {alert.targetPrice}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDelete(alert.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PriceAlerts;
