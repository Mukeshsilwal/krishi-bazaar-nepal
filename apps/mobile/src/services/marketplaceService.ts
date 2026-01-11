import api from './api';

export interface Listing {
    id: string;
    cropName: string;
    variety: string;
    quantity: number;
    unit: string;
    price: number;
    description: string;
    images: string[];
    farmerName: string;
    location: string;
    createdAt: string;
}

export const getListings = async (page = 0, size = 10, search = ''): Promise<any> => {
    // Matches Backend: /api/listings
    const response = await api.get(`/listings?page=${page}&size=${size}&cropName=${search}`);
    // Backend returns Page<ListingDto> wrapped in ApiResponse
    return response.data;
};

export const getListingDetail = async (id: string): Promise<Listing> => {
    const response = await api.get(`/listings/${id}`);
    return response.data.data;
};

export const createListing = async (data: any): Promise<any> => {
    const response = await api.post('/listings', data);
    return response.data;
};

export const uploadListingImage = async (id: string, imageUri: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', {
        uri: imageUri,
        name: 'listing_image.jpg',
        type: 'image/jpeg',
    } as any);

    const response = await api.post(`/listings/${id}/images`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.data;
};

export const createOrder = async (listingId: string, quantity: number, shippingAddress: string): Promise<any> => {
    const response = await api.post('/orders', {
        listingId,
        quantity,
        shippingAddress
    });
    return response.data.data;
};
