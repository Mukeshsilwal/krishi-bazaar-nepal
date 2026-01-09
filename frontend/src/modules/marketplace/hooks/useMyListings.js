import { useState, useEffect } from 'react';
import listingService from '../services/listingService';

export const useMyListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 20,
        totalPages: 0,
        totalElements: 0,
    });

    const fetchListings = async (page = 0, size = 20) => {
        setLoading(true);
        setError(null);
        try {
            const response = await listingService.getMyListings(page, size);
            // Response structure: { success, message, data: { content: [...], pageable, ... } }
            const pageData = response.data || response;
            setListings(pageData.content || []);
            setPagination({
                page: pageData.number || 0,
                size: pageData.size || size,
                totalPages: pageData.totalPages || 1,
                totalElements: pageData.totalElements || (pageData.content ? pageData.content.length : 0),
            });
        } catch (err) {
            setError(err.message || 'Failed to fetch listings');
            console.error('Error fetching listings:', err);
        } finally {
            setLoading(false);
        }
    };

    const createListing = async (listingData) => {
        try {
            const newListing = await listingService.createListing(listingData);
            await fetchListings(pagination.page, pagination.size);
            return newListing;
        } catch (err) {
            setError(err.message || 'Failed to create listing');
            throw err;
        }
    };

    const updateListing = async (id, listingData) => {
        try {
            const updatedListing = await listingService.updateListing(id, listingData);
            await fetchListings(pagination.page, pagination.size);
            return updatedListing;
        } catch (err) {
            setError(err.message || 'Failed to update listing');
            throw err;
        }
    };

    const deleteListing = async (id) => {
        try {
            await listingService.deleteListing(id);
            await fetchListings(pagination.page, pagination.size);
        } catch (err) {
            setError(err.message || 'Failed to delete listing');
            throw err;
        }
    };

    const uploadImage = async (listingId, file, isPrimary = false) => {
        try {
            const result = await listingService.uploadImage(listingId, file, isPrimary);
            await fetchListings(pagination.page, pagination.size);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to upload image');
            throw err;
        }
    };

    const getListingById = async (id) => {
        setLoading(true);
        try {
            const data = await listingService.getListing(id);
            return data.data || data;
        } catch (err) {
            setError(err.message || 'Failed to fetch listing details');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    return {
        listings,
        loading,
        error,
        pagination,
        createListing,
        updateListing,
        deleteListing,
        uploadImage,
        getListingById,
        refetch: fetchListings,
    };
};
