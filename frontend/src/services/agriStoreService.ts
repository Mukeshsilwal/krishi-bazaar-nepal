import api from './api';

export interface AgriProduct {
    id: string;
    name: string;
    category: 'SEEDS' | 'FERTILIZERS' | 'PESTICIDES' | 'TOOLS' | 'MACHINERY';
    description: string;
    brand: string;
    price: number;
    unit: string;
    stockQuantity: number;
    isActive: boolean;
    imageUrl: string;
}

export interface AgriProductParams {
    category?: string;
    search?: string;
    page?: number;
    size?: number;
}

export const agriStoreService = {
    getAllProducts: async (params: AgriProductParams) => {
        const response = await api.get('/agri-store/products', { params });
        return response.data;
    },

    getProductById: async (id: string) => {
        const response = await api.get(`/agri-store/products/${id}`);
        return response.data;
    },

    // Admin Endpoints
    createProduct: async (data: Partial<AgriProduct>) => {
        const response = await api.post('/admin/agri-store/products', data);
        return response.data;
    },

    updateProduct: async (id: string, data: Partial<AgriProduct>) => {
        const response = await api.put(`/admin/agri-store/products/${id}`, data);
        return response.data;
    },

    deleteProduct: async (id: string) => {
        await api.delete(`/admin/agri-store/products/${id}`);
    },

    updateStock: async (id: string, quantity: number) => {
        await api.patch(`/admin/agri-store/products/${id}/stock`, null, { params: { quantity } });
    }
};
