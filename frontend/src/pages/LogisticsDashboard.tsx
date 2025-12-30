import React, { useState, useEffect } from 'react';
import logisticsService from '../services/logisticsService';
import { Truck, Package, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LogisticsDashboard = () => {
    const [storages, setStorages] = useState([]);
    const [activeTab, setActiveTab] = useState('find-storage'); // 'find-storage' | 'track-shipment'
    const [district, setDistrict] = useState('');
    const [trackingId, setTrackingId] = useState('');
    const [trackingResult, setTrackingResult] = useState<any>(null);

    useEffect(() => {
        loadStorages();
    }, [district]);

    const loadStorages = async () => {
        try {
            const data = await logisticsService.getAllColdStorages(district);
            setStorages(data);
        } catch (error) {
            console.error("Error loading storages", error);
        }
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        try {
            const status = await logisticsService.getStatus(trackingId);
            setTrackingResult(status);
        } catch (error) {
            console.error("Error tracking", error);
            setTrackingResult({ error: 'Order not found' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Truck className="w-8 h-8 text-green-600" />
                        Logistics & Storage
                    </h1>
                    <p className="mt-2 text-gray-600">Find cold storage and track your shipments</p>
                </div>

                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('find-storage')}
                        className={`px-6 py-2 rounded-full font-medium transition ${activeTab === 'find-storage' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        Find Cold Storage
                    </button>
                    <button
                        onClick={() => setActiveTab('track-shipment')}
                        className={`px-6 py-2 rounded-full font-medium transition ${activeTab === 'track-shipment' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        Track Shipment
                    </button>
                </div>

                {activeTab === 'find-storage' ? (
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm flex gap-4">
                            <input
                                type="text"
                                placeholder="Filter by District (e.g. Chitwan)"
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                className="flex-1 rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {storages.map((storage: any) => (
                                <div key={storage.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-green-500 transition">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{storage.name}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <MapPin className="w-4 h-4" /> {storage.location}, {storage.district}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${storage.availableCapacity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {storage.availableCapacity > 0 ? 'Available' : 'Full'}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p>Capacity: {storage.capacity} kg</p>
                                        <p>Rate: Rs. {storage.pricePerKgPerDay} /kg/day</p>
                                    </div>
                                    <button className="mt-4 w-full bg-green-50 text-green-600 py-2 rounded-md hover:bg-green-100 font-medium transition">
                                        Book Storage
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white p-8 rounded-lg shadow-sm">
                            <h3 className="text-xl font-bold mb-6">Track Your Order</h3>
                            <form onSubmit={handleTrack} className="flex gap-4 mb-8">
                                <input
                                    type="text"
                                    placeholder="Enter Order ID"
                                    value={trackingId}
                                    onChange={(e) => setTrackingId(e.target.value)}
                                    className="flex-1 rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500"
                                />
                                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
                                    Track
                                </button>
                            </form>

                            {trackingResult && (
                                <div className="border-t pt-6">
                                    {trackingResult.error ? (
                                        <div className="text-red-500 text-center">{trackingResult.error}</div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                                    <Package className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Status</p>
                                                    <p className="text-lg font-bold text-green-700">{trackingResult}</p>
                                                </div>
                                            </div>
                                            {/* Process Steps Visualization could go here */}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default LogisticsDashboard;
