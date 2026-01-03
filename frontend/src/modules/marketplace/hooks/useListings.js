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

    const fetchListings = async (page = 0) => {
        try {
            setLoading(true);
            // Clean filters to remove empty strings
            const searchParams = { ...filters, page, size: pagination.size };
            Object.keys(searchParams).forEach(key => {
                if (searchParams[key] === '' || searchParams[key] === null) {
                    delete searchParams[key];
                }
            });

            const response = await listingService.searchListings(searchParams);

            if (response.success && response.data) {
                setListings(response.data.content || []);
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
        }
    };

    useEffect(() => {
        fetchListings();
    }, [JSON.stringify(filters)]);

    const nextPage = () => {
        if (pagination.page < pagination.totalPages - 1) {
            fetchListings(pagination.page + 1);
        }
    };

    const prevPage = () => {
        if (pagination.page > 0) {
            fetchListings(pagination.page - 1);
        }
    };

    const refresh = () => {
        fetchListings(pagination.page);
    };

    return {
        listings,
        loading,
        error,
        pagination,
        nextPage,
        prevPage,
        refresh,
    };
};
