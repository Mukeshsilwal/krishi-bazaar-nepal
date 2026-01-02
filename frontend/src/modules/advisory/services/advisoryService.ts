import api from '../../../services/api';
import { DISEASE_ENDPOINTS, ADVISORY_ENDPOINTS, RULE_ENDPOINTS, DIAGNOSIS_ENDPOINTS } from '../../../config/endpoints';

export interface Treatment {
    medicineName: string;
    type: string;
    isOrganic: boolean;
    dosage: string;
    safetyInstructions: string;
}

export interface DiseaseDiagnosis {
    diseaseName: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    symptoms: string;
    treatments: Treatment[];
    safetyDisclaimer: string;
}

export interface ContextualAdvisory {
    title: string;
    snippet: string;
    type: string;
    referenceId?: string;
    actionLabel: string;
}

const advisoryService = {
    diagnoseBySymptoms: async (symptom: string) => {
        const response = await api.get<DiseaseDiagnosis[]>('/diseases/diagnose', {
            params: { symptom }
        });
        return response.data;
    },

    getDiseasesByCrop: async (cropName: string) => {
        const response = await api.get<DiseaseDiagnosis[]>(DISEASE_ENDPOINTS.BY_CROP(cropName));
        return response.data;
    },

    getContextualAdvisory: async (context: string, param: string) => {
        const response = await api.get<ContextualAdvisory[]>('/advisory/contextual', {
            params: { context, param }
        });
        return response.data;
    },

    // Admin Methods
    createDisease: async (disease: any) => {
        const response = await api.post(DISEASE_ENDPOINTS.BASE, disease);
        return response.data;
    },

    createPesticide: async (pesticide: any) => {
        const response = await api.post('/diseases/pesticides', pesticide);
        return response.data;
    },

    getAllPesticides: async () => {
        const response = await api.get('/diseases/pesticides');
        return response.data;
    },

    linkPesticide: async (diseaseId: string, data: { pesticideId: string; dosage: string; interval: number; isPrimary: boolean }) => {
        if (!diseaseId || diseaseId === 'undefined') throw new Error('Invalid Disease ID');
        if (!data.pesticideId || data.pesticideId === 'undefined') throw new Error('Invalid Pesticide ID');

        await api.post(`/diseases/${diseaseId}/link-pesticide`, null, {
            params: data
        });
    },

    // Rule Engine Methods
    getAllRules: async () => {
        const response = await api.get(RULE_ENDPOINTS.BASE);
        return response.data;
    },

    createRule: async (rule: any) => {
        const response = await api.post(RULE_ENDPOINTS.BASE, rule);
        return response.data;
    },

    updateRule: async (id: string, rule: any) => {
        const response = await api.put(RULE_ENDPOINTS.BY_ID(id), rule);
        return response.data;
    },

    sendSignal: async (payload: any) => {
        const response = await api.post(DISEASE_ENDPOINTS.REPORT_SIGNAL, payload);
        return response.data;
    },

    submitFeedback: async (feedback: { userId: string; diseaseId?: string; queryText: string; isHelpful: boolean; comments?: string }) => {
        await api.post('/diseases/feedback', feedback);
    },

    getDiagnosisHistory: async (page = 0, size = 10) => {
        const response = await api.get('/diagnoses/history', {
            params: { page, size }
        });
        return response.data;
    }
};

export default advisoryService;
