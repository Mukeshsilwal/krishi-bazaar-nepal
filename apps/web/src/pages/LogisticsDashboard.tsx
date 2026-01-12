import React, { useState, useEffect } from 'react';
import logisticsService from '../services/logisticsService';
import { Truck, Package, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const LogisticsDashboard = () => {
    const [storages, setStorages] = useState([]);
    const [activeTab, setActiveTab] = useState('find-storage'); // 'find-storage' | 'track-shipment'
    const [district, setDistrict] = useState('');
    const [trackingId, setTrackingId] = useState('');
    const [trackingResult, setTrackingResult] = useState<any>(null);

    // New Booking State
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedStorage, setSelectedStorage] = useState<any>(null);
    const [bookingData, setBookingData] = useState({
        quantity: '',
        startDate: '',
        endDate: ''
    });

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
            // Simple heuristic: if it contains 'TRK-', it's a tracking code
            let status;
            if (trackingId.includes('TRK-')) {
                status = await logisticsService.trackShipment(trackingId);
            } else {
                status = await logisticsService.getShipmentByOrder(trackingId);
            }
            // Status is the full shipment object now
            setTrackingResult(status);
        } catch (error) {
            console.error("Error tracking", error);
            setTrackingResult({ error: 'Shipment not found' });
        }
    };

    const handleBookClick = (storage: any) => {
        setSelectedStorage(storage);
        setShowBookingModal(true);
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await logisticsService.bookStorage(selectedStorage.id, {
                quantity: parseFloat(bookingData.quantity),
                startDate: bookingData.startDate,
                endDate: bookingData.endDate
            });
            alert("Booking request sent successfully!");
            setShowBookingModal(false);
            setBookingData({ quantity: '', startDate: '', endDate: '' });
        } catch (error) {
            console.error("Booking failed", error);
            alert("Failed to book storage. Please try again.");
        }
    };

    return (
        <div className="bg-gray-50 min-h-full relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* ... existing header ... */}
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
                                    <button
                                        onClick={() => handleBookClick(storage)}
                                        className="mt-4 w-full bg-green-50 text-green-600 py-2 rounded-md hover:bg-green-100 font-medium transition"
                                    >
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
                                                    <p className="text-lg font-bold text-green-700">{trackingResult.status}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">From:</span>
                                                    <p className="font-medium">{trackingResult.sourceLocation}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">To:</span>
                                                    <p className="font-medium">{trackingResult.destinationLocation}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Estimated Delivery:</span>
                                                    <p className="font-medium">{trackingResult.estimatedDelivery ? new Date(trackingResult.estimatedDelivery).toLocaleDateString() : 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Tracking Code:</span>
                                                    <p className="font-medium">{trackingResult.trackingCode}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {showBookingModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4">Book Storage: {selectedStorage?.name}</h3>
                            <form onSubmit={handleBookingSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Quantity (kg)</label>
                                    <input
                                        type="number"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                        value={bookingData.quantity}
                                        onChange={(e) => setBookingData({ ...bookingData, quantity: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                        value={bookingData.startDate}
                                        onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                        value={bookingData.endDate}
                                        onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowBookingModal(false)}
                                        className="px-4 py-2 border rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Confirm Booking
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogisticsDashboard;
