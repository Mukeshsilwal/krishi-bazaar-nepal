import api from './api';
import { DIAGNOSIS_ENDPOINTS, ADMIN_DIAGNOSIS_ENDPOINTS } from '../config/endpoints';

export enum ReviewStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    CORRECTED = 'CORRECTED',
    REJECTED = 'REJECTED',
    FLAGGED_FOR_EXPERT = 'FLAGGED_FOR_EXPERT'
}

export interface AIDiagnosis {
    id: string;
    farmerId: string;
    cropType: string;
    growthStage?: string;
    district: string;
    inputType: 'IMAGE' | 'SYMPTOM_TEXT' | 'SENSOR';
    inputReferences: any;
    aiModelVersion?: string;
    aiPredictions: any;
    aiExplanation?: string;
    aiSeverity?: string;
    reviewStatus: ReviewStatus;
    reviewedBy?: string;
    reviewNotes?: string;
    finalDiagnosis?: string;
    createdAt: string;
}

export const diagnosisService = {
    submitDiagnosis: async (data: any) => {
        const response = await api.post(DIAGNOSIS_ENDPOINTS.BASE, data);
        return response.data;
    },

    getHistory: async (page = 0, size = 10) => {
        const response = await api.get(`/diagnoses/history?page=${page}&size=${size}`);
        return response.data;
    },

    getDiagnosis: async (id: string) => {
        const response = await api.get(DIAGNOSIS_ENDPOINTS.BY_ID(id));
        return response.data;
    },

    getReviewQueue: async (page = 0, size = 10) => {
        const response = await api.get(`/admin/diagnosis/queue?page=${page}&size=${size}`);
        return response.data;
    },

    reviewDiagnosis: async (id: string, data: { status: ReviewStatus; finalDiagnosis?: string; reviewNotes?: string }) => {
        const response = await api.post(ADMIN_DIAGNOSIS_ENDPOINTS.REVIEW(id), data);
        return response.data;
    }
};

export default diagnosisService;
