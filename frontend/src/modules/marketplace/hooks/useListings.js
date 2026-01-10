import { useState, useEffect } from 'react';
import listingService from '../services/listingService';

export const useListings = (filters = {}) => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 20,
        totalPages: 0,
        totalElements: 0,
    });

    // Track if we are specifically fetching the next page for infinite scroll
    const [isFetchingNext, setIsFetchingNext] = useState(false);

    const fetchListings = async (page = 0, options = { append: false }) => {
        try {
            if (options.append) {
                setIsFetchingNext(true);
            } else {
                setLoading(true);
            }

            // Clean filters to remove empty strings
            const searchParams = { ...filters, page, size: pagination.size };
            Object.keys(searchParams).forEach(key => {
                if (searchParams[key] === '' || searchParams[key] === null) {
                    delete searchParams[key];
                }
            });

            const response = await listingService.searchListings(searchParams);

            if (response.success && response.data) {
                const newData = response.data.content || [];

                setListings(prev => {
                    if (options.append) {
                        return [...prev, ...newData];
                    }
                    return newData;
                });

                setPagination({
                    page: response.data.pageable?.pageNumber ?? response.data.number ?? 0,
                    size: response.data.pageable?.pageSize ?? response.data.size ?? 20,
                    totalPages: response.data.totalPages || 0,
                    totalElements: response.data.totalElements || 0,
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch listings');
        } finally {
            setLoading(false);
            setIsFetchingNext(false);
        }
    };

    useEffect(() => {
        // Reset to page 0 when filters change
        fetchListings(0, { append: false });
    }, [JSON.stringify(filters)]);

    const nextPage = () => {
        if (pagination.page < pagination.totalPages - 1) {
            fetchListings(pagination.page + 1, { append: false });
        }
    };

    const prevPage = () => {
        if (pagination.page > 0) {
            fetchListings(pagination.page - 1, { append: false });
        }
    };

    const loadMore = () => {
        if (!isFetchingNext && pagination.page < pagination.totalPages - 1) {
            fetchListings(pagination.page + 1, { append: true });
        }
    };

    const refresh = () => {
        fetchListings(pagination.page, { append: false });
    };

    return {
        listings,
        loading, // Initial load or filter change
        isFetchingNext, // Infinite scroll loading state
        error,
        pagination,
        nextPage, // Manual pagination (replace)
        prevPage, // Manual pagination (replace)
        loadMore, // Infinite scroll (append)
        hasNextPage: pagination.page < pagination.totalPages - 1,
        refresh,
    };
};
