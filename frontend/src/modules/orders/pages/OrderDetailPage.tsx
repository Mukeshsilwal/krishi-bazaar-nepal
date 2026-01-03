import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import orderService from '../services/orderService';
import paymentService from '../../../services/paymentService';

export default function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const response = await orderService.getOrder(id!);
            if (response.success) {
                setOrder(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch order:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrder = async () => {
        setActionLoading(true);
        try {
            const response = await orderService.updateOrderStatus(id!, { status: 'CONFIRMED' });
            if (response.success) {
                setOrder(response.data);
                alert('Order confirmed successfully!');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to confirm order');
        } finally {
            setActionLoading(false);
        }
    };

    const handleInitiatePayment = async (method: string) => {
        setActionLoading(true);
        try {
            const response = await paymentService.initiatePayment({
                orderId: order.id,
                paymentMethod: method,
            });

            if (response.success) {
                if (response.data.data && response.data.data.htmlForm) {
                    // eSewa returns a full HTML form
                    // Create a container, inject the form, and submit it
                    const formContainer = document.createElement('div');
                    formContainer.innerHTML = response.data.data.htmlForm;
                    document.body.appendChild(formContainer);

                    // The form inside has onload="document.forms[0].submit()", 
                    // but since we are injecting it dynamically, we might need to trigger submit manually
                    const form = formContainer.querySelector('form');
                    if (form) {
                        form.submit();
                    }
                } else if (response.data.paymentUrl) {
                    // Fallback for payment methods that return a direct URL
                    window.location.href = response.data.paymentUrl;
                }
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to initiate payment');
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkReady = async () => {
        setActionLoading(true);
        try {
            const response = await orderService.updateOrderStatus(id!, { status: 'READY' });
            if (response.success) {
                setOrder(response.data);
                alert('Order marked as ready!');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update order');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateStatus = async (status: string) => {
        setActionLoading(true);
        try {
            const response = await orderService.updateOrderStatus(id!, { status });
            if (response.success) {
                setOrder(response.data);
                alert(`Order marked as ${status.replace(/_/g, ' ').toLowerCase()}!`);
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update order');
        } finally {
            setActionLoading(false);
        }
    };

    const handleComplete = async () => {
        await handleUpdateStatus('COMPLETED');
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        setActionLoading(true);
        try {
            await orderService.cancelOrder(id!);
            navigate('/orders');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
                    <button onClick={() => navigate('/orders')} className="text-green-600 hover:underline">
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    const isBuyer = user?.id === order.buyer.id;
    const isFarmer = user?.id === order.farmer.id;

    const getStatusColor = (status: string) => {
        const colors: any = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            CONFIRMED: 'bg-blue-100 text-blue-800',
            PAYMENT_PENDING: 'bg-orange-100 text-orange-800',
            PAID: 'bg-green-100 text-green-800',
            READY_FOR_HARVEST: 'bg-indigo-100 text-indigo-800',
            HARVESTED: 'bg-teal-100 text-teal-800',
            READY: 'bg-purple-100 text-purple-800',
            COMPLETED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate('/orders')}
                    className="text-green-600 hover:underline mb-6 flex items-center gap-2"
                >
                    ← Back to Orders
                </button>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Details</h1>
                            <p className="text-gray-600">Order ID: {order.id}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>

                    {/* Listing Info */}
                    <div className="border-t pt-6 mb-6">
                        <h2 className="font-semibold text-gray-900 mb-4">Crop Details</h2>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{order.listing.cropName}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <p>Quantity: {order.quantity} {order.listing.unit}</p>
                                    <p>Price per {order.listing.unit}: NPR {order.listing.pricePerUnit}</p>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-green-600">
                                        Total: NPR {order.totalAmount}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Parties Info */}
                    <div className="border-t pt-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Buyer</h3>
                                <div className="text-sm text-gray-600">
                                    <p>{order.buyer.name}</p>
                                    <p>{order.buyer.mobileNumber}</p>
                                    <p>{order.buyer.district}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Farmer</h3>
                                <div className="text-sm text-gray-600">
                                    <p>{order.farmer.name}</p>
                                    <p>{order.farmer.mobileNumber}</p>
                                    <p>{order.farmer.district}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pickup Details */}
                    {order.pickupLocation && (
                        <div className="border-t pt-6 mb-6">
                            <h3 className="font-semibold text-gray-900 mb-2">Pickup Details</h3>
                            <div className="text-sm text-gray-600">
                                <p>📍 Location: {order.pickupLocation}</p>
                                {order.pickupDate && (
                                    <p>📅 Date: {new Date(order.pickupDate).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="border-t pt-6">
                        <div className="flex flex-wrap gap-3">
                            {/* Farmer Actions */}
                            {isFarmer && order.status === 'PENDING' && (
                                <button
                                    onClick={handleConfirmOrder}
                                    disabled={actionLoading}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    Confirm Order
                                </button>
                            )}

                            {isFarmer && (order.status === 'CONFIRMED' || order.status === 'PAID') && (
                                <>
                                    <button
                                        onClick={() => handleUpdateStatus('READY_FOR_HARVEST')}
                                        disabled={actionLoading}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Start Harvest
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus('READY')}
                                        disabled={actionLoading}
                                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        Mark Ready (Skip Harvest)
                                    </button>
                                </>
                            )}

                            {isFarmer && order.status === 'READY_FOR_HARVEST' && (
                                <button
                                    onClick={() => handleUpdateStatus('HARVESTED')}
                                    disabled={actionLoading}
                                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50"
                                >
                                    Mark Harvested
                                </button>
                            )}

                            {isFarmer && order.status === 'HARVESTED' && (
                                <button
                                    onClick={() => handleUpdateStatus('READY')}
                                    disabled={actionLoading}
                                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                >
                                    Mark Ready for Pickup
                                </button>
                            )}

                            {/* Buyer Actions */}
                            {isBuyer && (order.status === 'CONFIRMED' || order.status === 'PAYMENT_PENDING') && (
                                <>
                                    <button
                                        onClick={() => handleInitiatePayment('ESEWA')}
                                        disabled={actionLoading}
                                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    >
                                        Pay with eSewa
                                    </button>
                                    <button
                                        onClick={() => handleInitiatePayment('KHALTI')}
                                        disabled={actionLoading}
                                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        Pay with Khalti
                                    </button>
                                </>
                            )}

                            {isBuyer && order.status === 'READY' && (
                                <button
                                    onClick={handleComplete}
                                    disabled={actionLoading}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    Mark as Completed
                                </button>
                            )}

                            {/* Cancel Button */}
                            {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                                <button
                                    onClick={handleCancel}
                                    disabled={actionLoading}
                                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    Cancel Order
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
