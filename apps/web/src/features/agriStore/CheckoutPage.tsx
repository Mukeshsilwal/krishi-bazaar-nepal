import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/services/api';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

const CheckoutPage = () => {
    const { items, totalAmount, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State
    const [pickupLocation, setPickupLocation] = useState(user?.district || '');
    const [notes, setNotes] = useState('');

    if (items.length === 0) {
        navigate('/cart');
        return null;
    }

    const handlePlaceOrder = async () => {
        if (!pickupLocation) {
            toast.error("Please enter a pickup location or delivery address");
            return;
        }

        setLoading(true);
        try {
            const orderRequest = {
                orderSource: 'AGRI_STORE',
                pickupLocation: pickupLocation,
                notes: notes,
                items: items.map(item => ({
                    agriProductId: item.product.id,
                    quantity: item.quantity
                }))
            };

            const response = await api.post('/orders', orderRequest);

            toast.success("Order placed successfully!");
            clearCart();
            // Redirect to the new order details page
            // API returns ApiResponse<OrderDto> so data is in response.data.data
            const orderId = response.data.data?.id;
            if (orderId) {
                navigate(`/orders/${orderId}`);
            } else {
                // Fallback if structure is different or missing
                console.warn("Order ID missing in response", response.data);
                navigate('/orders');
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to place order");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Button variant="ghost" className="mb-6" onClick={() => navigate('/cart')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
            </Button>

            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Shipping Details */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Full Name</Label>
                                <Input value={user?.name || ''} disabled className="bg-gray-100" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Phone Number</Label>
                                <Input value={user?.mobileNumber || ''} disabled className="bg-gray-100" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="location">Delivery Address / Pickup Location *</Label>
                                <Input
                                    id="location"
                                    value={pickupLocation}
                                    onChange={(e) => setPickupLocation(e.target.value)}
                                    placeholder="e.g. Kathmandu, Ward 4, Store Pickup"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Order Notes (Optional)</Label>
                                <Input
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Any special instructions..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 mb-6">
                                {items.map((item) => (
                                    <div key={item.product.id} className="flex justify-between items-start text-sm">
                                        <div>
                                            <span className="font-semibold">{item.product.name}</span>
                                            <div className="text-gray-500">x {item.quantity}</div>
                                        </div>
                                        <div>NPR {item.product.price * item.quantity}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total Amount</span>
                                    <span>NPR {totalAmount}</span>
                                </div>
                            </div>

                            <Button className="w-full mt-6" size="lg" onClick={handlePlaceOrder} disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Confirm Order"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
