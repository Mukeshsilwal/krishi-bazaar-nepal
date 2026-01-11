import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AgriProduct } from '@/services/agriStoreService';
import { ShoppingCart, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
    product: AgriProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const navigate = useNavigate();

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/agri-store/product/${product.id}`)}>
            <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                        <Leaf className="h-12 w-12" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge variant={product.stockQuantity > 0 ? "default" : "destructive"}>
                        {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                    </Badge>
                </div>
            </div>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                        <CardDescription className="line-clamp-1">{product.brand}</CardDescription>
                    </div>
                    <Badge variant="outline">{product.category}</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-xl font-bold text-green-600">
                    NPR {product.price} <span className="text-sm font-normal text-gray-500">/ {product.unit}</span>
                </p>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.description}</p>
            </CardContent>
            <CardFooter className="pt-2">
                <Button className="w-full" disabled={product.stockQuantity <= 0} onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/agri-store/product/${product.id}`);
                }}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {product.stockQuantity > 0 ? 'Buy Now' : 'Out of Stock'}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ProductCard;
