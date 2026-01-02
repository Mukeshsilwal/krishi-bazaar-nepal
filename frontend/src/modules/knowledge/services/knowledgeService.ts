import api from '../../../services/api';
import { KNOWLEDGE_ENDPOINTS } from '../../../config/endpoints';

export interface KnowledgeCategory {
    id: string;
    nameEn: string;
    nameNe: string;
    slug: string;
    iconUrl?: string;
}

export interface Article {
    id: string;
    titleEn: string;
    titleNe: string;
    contentEn: string;
    contentNe: string;
    category: KnowledgeCategory;
    tags: string[];
    coverImageUrl?: string;
    status: 'DRAFT' | 'REVIEW' | 'PUBLISHED';
    createdAt: string;
    updatedAt?: string;
}

const knowledgeService = {
    getCategories: async () => {
        const response = await api.get<KnowledgeCategory[]>(KNOWLEDGE_ENDPOINTS.CATEGORIES);
        return response.data;
    },

    getArticles: async (categoryId?: string, tag?: string, status?: string) => {
        const params: any = {};
        if (categoryId && categoryId !== 'undefined') params.categoryId = categoryId;
        if (tag && tag !== 'undefined') params.tag = tag;
        if (status && status !== 'undefined') params.status = status;

        const response = await api.get<Article[]>(KNOWLEDGE_ENDPOINTS.ARTICLES, { params });
        return response.data;
    },

    getArticleById: async (id: string) => {
        if (!id || id === 'undefined') throw new Error('Invalid Article ID');
        const response = await api.get<Article>(KNOWLEDGE_ENDPOINTS.ARTICLE_BY_ID(id));
        return response.data;
    },

    // Admin Methods
    createCategory: async (category: Partial<KnowledgeCategory>) => {
        const response = await api.post<KnowledgeCategory>(KNOWLEDGE_ENDPOINTS.CATEGORIES, category);
        return response.data;
    },

    createArticle: async (article: Partial<Article>) => {
        const response = await api.post<Article>(KNOWLEDGE_ENDPOINTS.ARTICLES, article);
        return response.data;
    },

    updateArticle: async (id: string, article: Partial<Article>) => {
        const response = await api.put<Article>(KNOWLEDGE_ENDPOINTS.ARTICLE_BY_ID(id), article);
        return response.data;
    },

    deleteArticle: async (id: string) => {
        await api.delete(KNOWLEDGE_ENDPOINTS.ARTICLE_BY_ID(id));
    }
};

export default knowledgeService;
