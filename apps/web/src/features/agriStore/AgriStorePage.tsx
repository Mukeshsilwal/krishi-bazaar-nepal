import { useState, useRef, useCallback } from 'react';
import { AgriProduct } from '@/services/agriStoreService';
import ProductCard from './components/ProductCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAgriProducts } from './hooks/useAgriProducts';

const AgriStorePage = () => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string>('ALL');

    const { products, loading, isFetchingNext, hasNextPage, loadMore } = useAgriProducts({ search, category });

    // Infinite Scroll Observer
    const observer = useRef<IntersectionObserver | null>(null);
    const lastProductRef = useCallback((node: HTMLDivElement | null) => {
        if (loading || isFetchingNext) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                loadMore();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, isFetchingNext, hasNextPage, loadMore]);


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
                <>
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

                    {/* Infinite Scroll Loader & Sentinel */}
                    {isFetchingNext && (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                    )}

                    {!hasNextPage && !loading && products.length > 0 && (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            End of results
                        </div>
                    )}

                    {/* Invisible Sentinel for Intersection Observer */}
                    <div ref={lastProductRef} className="h-4 w-full" />
                </>
            )}
        </div>
    );
};

export default AgriStorePage;
