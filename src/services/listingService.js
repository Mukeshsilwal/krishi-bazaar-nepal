import api from './api';

const listingService = {
    // Get all listings with filters
    getListings: async (params = {}) => {
        const response = await api.get('/listings', { params });
        return response.data;
    },

    // Get single listing by ID
    getListing: async (id) => {
        const response = await api.get(`/listings/${id}`);
        return response.data;
    },

    // Get my listings (farmer)
    getMyListings: async (page = 0, size = 20) => {
        const response = await api.get('/listings/my', {
            params: { page, size },
        });
        return response.data;
    },

    // Create new listing
    createListing: async (listingData) => {
        const response = await api.post('/listings', listingData);
        return response.data;
    },

    // Update listing
    updateListing: async (id, listingData) => {
        const response = await api.put(`/listings/${id}`, listingData);
        return response.data;
    },

    // Delete listing
    deleteListing: async (id) => {
        const response = await api.delete(`/listings/${id}`);
        return response.data;
    },

    // Upload image for listing
    uploadImage: async (listingId, file, isPrimary = false) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('isPrimary', isPrimary);

        const response = await api.post(`/listings/${listingId}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get available crops
    getAvailableCrops: async () => {
        const response = await api.get('/listings/crops');
        return response.data;
    },

    // Search listings
    searchListings: async (searchParams) => {
        const response = await api.get('/listings', {
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
