import api from './api';

export interface ContentDTO {
    id: string;
    contentType: 'CROP' | 'DISEASE' | 'PEST' | 'WEATHER' | 'POLICY' | 'EMERGENCY';
    title: string;
    summary: string;
    structuredBody: any; // JSON
    supportedCrops: string[];
    supportedGrowthStages: string[];
    supportedRegions: string[];
    severity?: 'INFO' | 'WARNING' | 'EMERGENCY';
    language: string;
    sourceType?: 'EXPERT' | 'GOVT' | 'INGESTED';
    sourceReference?: string;
    version: number;
    status: 'DRAFT' | 'REVIEW' | 'ACTIVE' | 'DEPRECATED';
    tags: string[];
    linkedRuleIds: string[];
    createdBy?: string;
    updatedAt?: string;
    publishedAt?: string;
}

export interface ContentFilterDTO {
    contentType?: string;
    status?: string;
    crop?: string;
    region?: string;
    severity?: string;
    page?: number;
    size?: number;
}

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}

export const contentService = {
    getContents: async (filters: ContentFilterDTO): Promise<Page<ContentDTO>> => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });
        const response = await api.get(`/admin/content?${params.toString()}`);
        // Handle Spring Page response or custom ApiResponse wrapper
        if (response.data.data) return response.data.data;
        return response.data;
    },

    getContent: async (id: string): Promise<ContentDTO> => {
        const response = await api.get(`/admin/content/${id}`);
        return response.data.data || response.data;
    },

    createContent: async (content: Partial<ContentDTO>): Promise<ContentDTO> => {
        const response = await api.post('/admin/content', content);
        return response.data.data || response.data;
    },

    updateContent: async (id: string, content: Partial<ContentDTO>, reason?: string): Promise<ContentDTO> => {
        const response = await api.put(`/admin/content/${id}`, content, {
            params: { reason }
        });
        return response.data.data || response.data;
    },

    submitForReview: async (id: string): Promise<void> => {
        await api.post(`/admin/content/${id}/review`);
    },

    publishContent: async (id: string): Promise<void> => {
        await api.post(`/admin/content/${id}/publish`);
    },

    deprecateContent: async (id: string): Promise<void> => {
        await api.post(`/admin/content/${id}/deprecate`);
    }
};
