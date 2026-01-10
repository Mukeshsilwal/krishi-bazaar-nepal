import { useState, useEffect } from 'react';
import { agriStoreService, AgriProduct } from '@/services/agriStoreService';

export const useAgriProducts = (filters: any) => {
    const [products, setProducts] = useState<AgriProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingNext, setIsFetchingNext] = useState(false);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 20,
        totalPages: 0,
        totalElements: 0,
    });

    const fetchProducts = async (page = 0, options = { append: false }) => {
        try {
            if (options.append) {
                setIsFetchingNext(true);
            } else {
                setLoading(true);
            }

            const params = { ...filters, page, size: pagination.size };
            // Clean empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === 'ALL') {
                    delete params[key];
                }
            });

            const data = await agriStoreService.getAllProducts(params);

            if (data) {
                const newProducts = data.content || [];
                setProducts(prev => {
                    if (options.append) {
                        return [...prev, ...newProducts];
                    }
                    return newProducts;
                });

                setPagination({
                    page: data.pageable?.pageNumber ?? data.number ?? 0,
                    size: data.pageable?.pageSize ?? data.size ?? 20,
                    totalPages: data.totalPages || 0,
                    totalElements: data.totalElements || 0,
                });
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
            setIsFetchingNext(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(0, { append: false });
        }, 500); // Debounce included
        return () => clearTimeout(timer);
    }, [JSON.stringify(filters)]);

    const loadMore = () => {
        if (!isFetchingNext && pagination.page < pagination.totalPages - 1) {
            fetchProducts(pagination.page + 1, { append: true });
        }
    };

    return {
        products,
        loading,
        isFetchingNext,
        hasNextPage: pagination.page < pagination.totalPages - 1,
        loadMore
    };
};
