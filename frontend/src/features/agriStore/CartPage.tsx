import React from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const { items, updateQuantity, removeItem, totalAmount, totalItems } = useCart();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
                <p className="text-gray-600 mb-8">Looks like you haven't added any items yet.</p>
                <Button onClick={() => navigate('/agri-store')}>Browse Agri Store</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="md:col-span-2 space-y-4">
                    {items.map(({ product, quantity }) => (
                        <div key={product.id} className="flex gap-4 p-4 bg-white border rounded-lg shadow-sm">
                            <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                )}
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between mb-2">
                                    <h3 className="font-semibold text-lg">{product.name}</h3>
                                    <button
                                        onClick={() => removeItem(product.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <p className="text-gray-600 text-sm mb-4">{product.brand}</p>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center border rounded-md">
                                        <button
                                            className="p-1 hover:bg-gray-100 disabled:opacity-50"
                                            onClick={() => updateQuantity(product.id, quantity - 1)}
                                            disabled={quantity <= 1}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                                        <button
                                            className="p-1 hover:bg-gray-100 disabled:opacity-50"
                                            onClick={() => updateQuantity(product.id, quantity + 1)}
                                            disabled={quantity >= product.stockQuantity}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="font-bold text-green-600">
                                        NPR {product.price * quantity}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="bg-white p-6 rounded-lg border shadow-sm h-fit">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    <div className="space-y-2 mb-4 text-gray-600">
                        <div className="flex justify-between">
                            <span>Total Items</span>
                            <span>{totalItems}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>NPR {totalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Delivery</span>
                            <span className="text-sm text-gray-400">(Calculated at checkout)</span>
                        </div>
                    </div>
                    <div className="border-t pt-4 mb-6">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>NPR {totalAmount}</span>
                        </div>
                    </div>
                    <Button className="w-full" onClick={() => navigate('/checkout')}>
                        Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
