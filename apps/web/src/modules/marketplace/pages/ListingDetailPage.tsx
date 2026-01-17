import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import listingService from '../services/listingService';
import orderService from '../../orders/services/orderService';

export default function ListingDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [pickupDate, setPickupDate] = useState('');
    const [orderLoading, setOrderLoading] = useState(false);
    const [confirmOrderDialog, setConfirmOrderDialog] = useState(false);

    useEffect(() => {
        fetchListing();
    }, [id]);

    const fetchListing = async () => {
        try {
            const response = await listingService.getListing(id!);
            if (response.code === 0) {
                setListing(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch listing:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrderClick = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!pickupDate) {
            toast.error('Please select a pickup date');
            return;
        }
        setConfirmOrderDialog(true);
    };

    const handleConfirmOrder = async () => {
        setOrderLoading(true);
        try {
            const response = await orderService.createOrder({
                listingId: listing.id,
                quantity,
                pickupDate,
                pickupLocation: listing.location,
            });

            if (response.code === 0) {
                toast.success('Order placed successfully!');
                navigate(`/orders/${response.data.id}`);
            } else {
                toast.error(response.message || 'Failed to place order');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setOrderLoading(false);
            setConfirmOrderDialog(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="text-green-600 hover:underline"
                    >
                        Back to Marketplace
                    </button>
                </div>
            </div>
        );
    }

    const totalPrice = listing.pricePerUnit * quantity;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate('/')}
                    className="text-green-600 hover:underline mb-6 flex items-center gap-2"
                >
                    ← Back to Marketplace
                </button>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                        {/* Images */}
                        <div>
                            <div className="h-96 bg-gray-200 rounded-lg overflow-hidden mb-4">
                                {listing.images && listing.images.length > 0 ? (
                                    <img
                                        src={listing.images.find((img: any) => img.isPrimary)?.imageUrl || listing.images[0]?.imageUrl}
                                        alt={listing.cropName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image Available
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Gallery */}
                            {listing.images && listing.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {listing.images.map((img: any) => (
                                        <div key={img.id} className="h-20 bg-gray-200 rounded overflow-hidden">
                                            <img
                                                src={img.imageUrl}
                                                alt="Thumbnail"
                                                className="w-full h-full object-cover cursor-pointer hover:opacity-75"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{listing.cropName}</h1>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl font-bold text-green-600">
                                        NPR {listing.pricePerUnit}
                                    </span>
                                    <span className="text-gray-600">per {listing.unit}</span>
                                </div>
                                <p className="text-gray-600">
                                    Available: {listing.quantity} {listing.unit}
                                </p>
                            </div>

                            {/* Farmer Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-gray-900 mb-2">Farmer Information</h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p>👨‍🌾 {listing.farmer.name}</p>
                                    <p>📍 {listing.farmer.district}, Ward {listing.farmer.ward}</p>
                                    <p>📞 {listing.farmer.mobileNumber}</p>
                                    {listing.farmer.verified && (
                                        <p className="text-green-600 font-medium">✓ Verified Farmer</p>
                                    )}
                                    {user?.id !== listing.farmer.id && (
                                        <button
                                            onClick={() => navigate(`/chat/${listing.farmer.id}`, { state: { targetUser: listing.farmer } })}
                                            className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                        >
                                            <MessageCircle size={18} />
                                            Chat with Farmer
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {listing.description && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-600">{listing.description}</p>
                                </div>
                            )}

                            {/* Additional Info */}
                            <div className="mb-6 space-y-2 text-sm text-gray-600">
                                {listing.harvestDate && (
                                    <p>🌾 Harvest Date: {new Date(listing.harvestDate).toLocaleDateString()}</p>
                                )}
                                {listing.harvestWindow && (
                                    <p>📅 Harvest Window: {listing.harvestWindow} days</p>
                                )}
                                {listing.dailyQuantityLimit && (
                                    <p>📦 Daily Limit: {listing.dailyQuantityLimit} {listing.unit}</p>
                                )}
                                {listing.orderCutoffTime && (
                                    <p>⏰ Order Cutoff: {listing.orderCutoffTime}</p>
                                )}
                                <p>📍 Pickup Location: {listing.location}</p>
                            </div>

                            {/* Order Section */}
                            {user?.id !== listing.farmer.id && (
                                <div className="border-t pt-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Place Order</h3>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Quantity ({listing.unit})
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={listing.quantity}
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Pickup Date
                                        </label>
                                        <input
                                            type="date"
                                            value={pickupDate}
                                            onChange={(e) => setPickupDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                    </div>

                                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-700">Total Amount:</span>
                                            <span className="text-2xl font-bold text-green-600">
                                                NPR {totalPrice.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handlePlaceOrderClick}
                                        disabled={orderLoading}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        Place Order
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            <ConfirmDialog
                open={confirmOrderDialog}
                onOpenChange={setConfirmOrderDialog}
                onConfirm={handleConfirmOrder}
                title="Confirm Order"
                description={`Are you sure you want to place this order for ${quantity} ${listing.unit} of ${listing.cropName}? Total cost: NPR ${totalPrice.toFixed(2)}`}
                confirmText="Place Order"
                cancelText="Cancel"
                variant="default"
                icon={<ShoppingCart className="h-6 w-6 text-green-600" />}
            />
        </div >
    );
}
