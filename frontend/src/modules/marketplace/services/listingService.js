import api from '../../../services/api';
import { MARKETPLACE_ENDPOINTS } from '../../../config/endpoints';

const listingService = {
    // Get all listings with filters
    getListings: async (params = {}) => {
        const response = await api.get(MARKETPLACE_ENDPOINTS.LISTINGS, { params });
        return response.data;
    },

    // Get single listing by ID
    getListing: async (id) => {
        const response = await api.get(MARKETPLACE_ENDPOINTS.LISTING_BY_ID(id));
        return response.data;
    },

    // Get my listings (farmer)
    getMyListings: async (page = 0, size = 20) => {
        const response = await api.get(MARKETPLACE_ENDPOINTS.MY_LISTINGS, {
            params: { page, size },
        });
        return response.data;
    },

    // Create new listing
    createListing: async (listingData) => {
        const response = await api.post(MARKETPLACE_ENDPOINTS.LISTINGS, listingData);
        return response.data;
    },

    // Update listing
    updateListing: async (id, listingData) => {
        const response = await api.put(MARKETPLACE_ENDPOINTS.LISTING_BY_ID(id), listingData);
        return response.data;
    },

    // Delete listing
    deleteListing: async (id) => {
        const response = await api.delete(MARKETPLACE_ENDPOINTS.LISTING_BY_ID(id));
        return response.data;
    },

    // Upload image for listing
    uploadImage: async (listingId, file, isPrimary = false) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('isPrimary', isPrimary);

        const response = await api.post(MARKETPLACE_ENDPOINTS.UPLOAD_IMAGE(listingId), formData);
        return response.data;
    },

    // Get available crops
    getAvailableCrops: async () => {
        const response = await api.get(MARKETPLACE_ENDPOINTS.CROPS);
        return response.data;
    },

    // Search listings
    searchListings: async (searchParams) => {
        const response = await api.get(MARKETPLACE_ENDPOINTS.LISTINGS, {
            params: {
                page: searchParams.page || 0,
                size: searchParams.size || 20,
                cropName: searchParams.cropName,
                district: searchParams.district,
                minPrice: searchParams.minPrice,
                maxPrice: searchParams.maxPrice,
                sortBy: searchParams.sortBy,
            },
        });
        return response.data;
    },
};

export default listingService;
