import React, { useState, useEffect } from 'react';
import { agriStoreService, AgriProduct } from '@/services/agriStoreService';
import ProductCard from './components/ProductCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const AgriStorePage = () => {
    const [products, setProducts] = useState<AgriProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string>('ALL');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (search) params.search = search;
            if (category && category !== 'ALL') params.category = category;

            const data = await agriStoreService.getAllProducts(params);
            setProducts(data.content);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchProducts();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, category]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Agri Store</h1>
                <p className="text-gray-600 mb-6">High quality agricultural inputs for your farm.</p>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search seeds, fertilizers..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Categories</SelectItem>
                            <SelectItem value="SEEDS">Seeds</SelectItem>
                            <SelectItem value="FERTILIZERS">Fertilizers</SelectItem>
                            <SelectItem value="PESTICIDES">Pesticides</SelectItem>
                            <SelectItem value="TOOLS">Tools</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No products found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AgriStorePage;
