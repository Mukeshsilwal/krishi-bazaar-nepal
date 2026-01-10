import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agriStoreService, AgriProduct } from '@/services/agriStoreService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Leaf, ArrowLeft, ShoppingCart, Minus, Plus, Loader2 } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useCart } from '@/context/CartContext';
import api from '@/services/api';

const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState<AgriProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCart();
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (id) {
            loadProduct(id);
        }
    }, [id]);

    const loadProduct = async (productId: string) => {
        try {
            const data = await agriStoreService.getProductById(productId);
            setProduct(data);
        } catch (error) {
            toast.error("Failed to load product");
            navigate('/agri-store');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (delta: number) => {
        const newQty = quantity + delta;
        if (newQty >= 1 && newQty <= (product?.stockQuantity || 1)) {
            setQuantity(newQty);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;
        setAdding(true);
        addItem(product, quantity);
        setAdding(false);
        // Optional: Open cart or show toast (Toast handled in context)
    };

    if (loading) return <LoadingSpinner />;
    if (!product) return <div>Product not found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <Button variant="ghost" className="mb-6" onClick={() => navigate('/agri-store')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
            </Button>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Image Section */}
                <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 h-[400px] flex items-center justify-center">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                        <Leaf className="h-32 w-32 text-gray-400" />
                    )}
                </div>

                {/* Details Section */}
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                            <p className="text-xl text-gray-600">{product.brand}</p>
                        </div>
                        <Badge variant={product.stockQuantity > 0 ? "default" : "destructive"} className="text-lg px-3 py-1">
                            {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                        </Badge>
                    </div>

                    <div className="text-4xl font-bold text-green-600 mb-6">
                        NPR {product.price} <span className="text-lg text-gray-500 font-normal">/ {product.unit}</span>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                        {product.description}
                    </p>

                    <div className="border-t border-b py-6 mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="font-semibold text-lg">Quantity:</span>
                            <div className="flex items-center border rounded-md">
                                <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-12 text-center font-bold">{quantity}</span>
                                <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stockQuantity}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <p className="text-gray-500">
                            Total: <span className="font-bold text-black dark:text-white">NPR {product.price * quantity}</span>
                        </p>
                    </div>

                    <Button size="lg" className="w-full md:w-auto px-12" onClick={handleAddToCart} disabled={adding || product.stockQuantity <= 0}>
                        {adding ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                            <>
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Add to Cart
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
