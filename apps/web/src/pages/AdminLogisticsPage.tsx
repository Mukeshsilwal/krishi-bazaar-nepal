import React, { useState, useEffect } from 'react';
import api from '../services/api';
import logisticsService from '../services/logisticsService';
import { COLD_STORAGE_ENDPOINTS, LOGISTICS_ENDPOINTS } from '../config/endpoints';
import { Truck, Warehouse, Package, MapPin, Check, X, Search } from 'lucide-react';
import { toast } from 'sonner';

const AdminLogisticsPage = () => {
    const [activeTab, setActiveTab] = useState('storage'); // 'storage' | 'shipments'
    const [storages, setStorages] = useState([]);
    const [shipments, setShipments] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // New Storage Form
    const [showAddStorage, setShowAddStorage] = useState(false);
    const [newStorage, setNewStorage] = useState({
        name: '',
        location: '',
        district: '',
        capacity: '',
        availableCapacity: '',
        pricePerKgPerDay: '',
        temperatureRange: '',
        contactNumber: '',
        isActive: true
    });

    useEffect(() => {
        if (activeTab === 'storage') fetchStorages();
        else if (activeTab === 'shipments') fetchShipments();
        else if (activeTab === 'bookings') fetchBookings();
    }, [activeTab]);

    const fetchStorages = async () => {
        setLoading(true);
        try {
            const response = await api.get(COLD_STORAGE_ENDPOINTS.BASE, { params: { size: 100 } });
            const data = response.data.data;
            const content = data?.content || data;
            setStorages(Array.isArray(content) ? content : []);
        } catch (error) {
            toast.error("Failed to load cold storages");
            setStorages([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchShipments = async () => {
        setLoading(true);
        try {
            // Updated Endpoint for Admin GetAll
            const response = await api.get('/logistics/shipments');
            setShipments(response.data.data.content || []);
        } catch (error) {
            toast.error("Failed to load shipments");
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            // Request large page size to keep UI simple for now
            const response = await logisticsService.getAllBookings({ page: 0, size: 100, sort: 'id,desc' });
            setBookings(response || []);
        } catch (error) {
            toast.error("Failed to load bookings");
            setBookings([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStorage = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(COLD_STORAGE_ENDPOINTS.BASE, newStorage);
            toast.success("Cold Storage added successfully");
            setShowAddStorage(false);
            fetchStorages();
            setNewStorage({
                name: '', location: '', district: '', capacity: '', availableCapacity: '',
                pricePerKgPerDay: '', temperatureRange: '', contactNumber: '', isActive: true
            });
        } catch (error) {
            toast.error("Failed to add cold storage");
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await api.put(LOGISTICS_ENDPOINTS.UPDATE_STATUS(id), status, {
                headers: { 'Content-Type': 'application/json' }
            });
            toast.success("Status updated");
            fetchShipments();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Truck className="w-8 h-8 text-green-600" />
                    Logistics Management
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('storage')}
                        className={`px-4 py-2 rounded-md ${activeTab === 'storage' ? 'bg-green-600 text-white' : 'bg-white border hover:bg-gray-50'}`}
                    >
                        Cold Storages
                    </button>
                    <button
                        onClick={() => setActiveTab('shipments')}
                        className={`px-4 py-2 rounded-md ${activeTab === 'shipments' ? 'bg-green-600 text-white' : 'bg-white border hover:bg-gray-50'}`}
                    >
                        Shipments
                    </button>
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`px-4 py-2 rounded-md ${activeTab === 'bookings' ? 'bg-green-600 text-white' : 'bg-white border hover:bg-gray-50'}`}
                    >
                        Bookings
                    </button>
                </div>
            </div>

            {activeTab === 'storage' && (
                <div>
                    <div className="mb-4 flex justify-end">
                        <button
                            onClick={() => setShowAddStorage(!showAddStorage)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                        >
                            <Warehouse className="w-4 h-4" /> Add Facility
                        </button>
                    </div>

                    {showAddStorage && (
                        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-green-100">
                            <h3 className="font-bold mb-4">Add New Cold Storage</h3>
                            <form onSubmit={handleCreateStorage} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input placeholder="Name" className="border p-2 rounded" required value={newStorage.name} onChange={e => setNewStorage({ ...newStorage, name: e.target.value })} />
                                <input placeholder="District" className="border p-2 rounded" required value={newStorage.district} onChange={e => setNewStorage({ ...newStorage, district: e.target.value })} />
                                <input placeholder="Location (Address)" className="border p-2 rounded" required value={newStorage.location} onChange={e => setNewStorage({ ...newStorage, location: e.target.value })} />
                                <input placeholder="Capacity (kg)" type="number" className="border p-2 rounded" required value={newStorage.capacity} onChange={e => setNewStorage({ ...newStorage, capacity: e.target.value })} />
                                <input placeholder="Available Capacity (kg)" type="number" className="border p-2 rounded" required value={newStorage.availableCapacity} onChange={e => setNewStorage({ ...newStorage, availableCapacity: e.target.value })} />
                                <input placeholder="Price/Kg/Day" type="number" className="border p-2 rounded" value={newStorage.pricePerKgPerDay} onChange={e => setNewStorage({ ...newStorage, pricePerKgPerDay: e.target.value })} />
                                <input placeholder="Temp Range (e.g. -5 to 5)" className="border p-2 rounded" value={newStorage.temperatureRange} onChange={e => setNewStorage({ ...newStorage, temperatureRange: e.target.value })} />
                                <input placeholder="Contact Number" className="border p-2 rounded" value={newStorage.contactNumber} onChange={e => setNewStorage({ ...newStorage, contactNumber: e.target.value })} />
                                <div className="md:col-span-2 flex justify-end gap-2">
                                    <button type="button" onClick={() => setShowAddStorage(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        {storages.map((storage: any) => (
                            <div key={storage.id} className="bg-white p-4 rounded shadow-sm border flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{storage.name}</h3>
                                    <p className="text-sm text-gray-500">{storage.location}, {storage.district}</p>
                                    <div className="text-xs text-gray-400 mt-1 flex gap-2">
                                        <span>Cap: {storage.capacity}kg</span>
                                        <span>Range: {storage.temperatureRange || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded text-xs ${storage.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {storage.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'shipments' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Tracking Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Locations</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {shipments.map((shipment: any) => (
                                    <tr key={shipment.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{shipment.trackingCode}</div>
                                            <div className="text-xs text-gray-500">Order: {shipment.orderId}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                    shipment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {shipment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>From: {shipment.sourceLocation}</div>
                                            <div>To: {shipment.destinationLocation}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <select
                                                value={shipment.status}
                                                onChange={(e) => handleUpdateStatus(shipment.id, e.target.value)}
                                                className="border rounded px-2 py-1 text-xs"
                                            >
                                                <option value="CREATED">CREATED</option>
                                                <option value="ASSIGNED">ASSIGNED</option>
                                                <option value="IN_TRANSIT">IN_TRANSIT</option>
                                                <option value="DELIVERED">DELIVERED</option>
                                                <option value="CANCELLED">CANCELLED</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'bookings' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p>No bookings found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Booking ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Storage ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Farmer ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Quantity (kg)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Dates</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Total Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bookings.map((booking: any) => (
                                        <tr key={booking.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{booking.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.coldStorageId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.farmerId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.quantity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {booking.startDate} to {booking.endDate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                Rs. {booking.totalPrice}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${booking.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminLogisticsPage;
