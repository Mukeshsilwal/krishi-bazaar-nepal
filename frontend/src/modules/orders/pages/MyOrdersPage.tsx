import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../auth/context/AuthContext';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function MyOrdersPage() {
    const { orders, loading, error } = useOrders();
    const { t } = useLanguage();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('buyer'); // 'buyer' or 'farmer'
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Ensure orders is always an array
    const ordersArray = Array.isArray(orders) ? orders : [];

    // Debug logging
    console.log('[MyOrdersPage] Current User:', user);
    console.log('[MyOrdersPage] All Orders:', ordersArray);

    const buyerOrders = ordersArray.filter((order) => {
        const match = order.buyer?.id === user?.id;
        console.log(`[MyOrdersPage] Buyer Filter: Order ${order.id} Buyer ${order.buyer?.id} vs User ${user?.id} -> ${match}`);
        return match;
    });
    const farmerOrders = ordersArray.filter((order) => order.farmer?.id === user?.id);



    const displayOrders = activeTab === 'buyer' ? buyerOrders : farmerOrders;
    const filteredOrders =
        statusFilter === 'ALL'
            ? displayOrders
            : displayOrders.filter((order) => order.status === statusFilter);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <Clock className="text-yellow-600" size={20} />;
            case 'CONFIRMED':
                return <CheckCircle className="text-blue-600" size={20} />;
            case 'READY_FOR_HARVEST':
                return <Package className="text-indigo-600" size={20} />;
            case 'HARVESTED':
                return <Package className="text-teal-600" size={20} />;
            case 'PAID':
            case 'COMPLETED':
            case 'READY':
                return <CheckCircle className="text-green-600" size={20} />;
            case 'CANCELLED':
                return <XCircle className="text-red-600" size={20} />;
            default:
                return <Package className="text-blue-600" size={20} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED':
                return 'bg-blue-100 text-blue-800';
            case 'READY_FOR_HARVEST':
                return 'bg-indigo-100 text-indigo-800';
            case 'HARVESTED':
                return 'bg-teal-100 text-teal-800';
            case 'PAID':
                return 'bg-green-100 text-green-800';
            case 'READY':
                return 'bg-purple-100 text-purple-800';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-gray-50 min-h-full">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('dashboard.myOrders') || 'My Orders'}
                    </h1>
                    <p className="text-gray-600">
                        {t('orders.manage') || 'View and manage your orders'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('buyer')}
                            className={`pb-4 px-2 font-semibold transition ${activeTab === 'buyer'
                                ? 'border-b-2 border-green-600 text-green-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {t('orders.asBuyer') || 'As Buyer'} ({buyerOrders.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('farmer')}
                            className={`pb-4 px-2 font-semibold transition ${activeTab === 'farmer'
                                ? 'border-b-2 border-green-600 text-green-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {t('orders.asFarmer') || 'As Farmer'} ({farmerOrders.length})
                        </button>
                    </div>
                </div>

                {/* Status Filter */}
                <div className="mb-6 flex gap-2 flex-wrap">
                    {['ALL', 'PENDING', 'CONFIRMED', 'PAID', 'COMPLETED', 'CANCELLED'].map(
                        (status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === status
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {status}
                            </button>
                        )
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading orders...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Orders List */}
                {!loading && !error && (
                    <>
                        {filteredOrders.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-12 text-center">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No orders found
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {activeTab === 'buyer'
                                        ? 'Start browsing the marketplace to place your first order'
                                        : 'No orders received yet'}
                                </p>
                                {activeTab === 'buyer' && (
                                    <Link
                                        to="/marketplace"
                                        className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                                    >
                                        Browse Marketplace
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(order.status)}
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {order.listing?.cropName || 'Unknown Crop'}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        Order #{order.id.substring(0, 8)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Quantity</p>
                                                <p className="font-semibold">
                                                    {order.quantity} {order.listing?.unit}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Total Amount</p>
                                                <p className="font-semibold text-green-600">
                                                    Rs. {order.totalAmount}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Order Date</p>
                                                <p className="font-semibold">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {order.pickupDate && (
                                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                                <p className="text-sm text-blue-900">
                                                    <strong>Pickup:</strong>{' '}
                                                    {new Date(order.pickupDate).toLocaleDateString()} at{' '}
                                                    {order.pickupLocation}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <Link
                                                to={`/orders/${order.id}`}
                                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-center"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
