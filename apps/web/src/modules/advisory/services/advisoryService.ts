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

export interface Pesticide {
    id: string;
    name: string;
    targetDiseases: string[];
    applicationMethod: string;
    dosage: string;
    safetyPeriod: number;
    precautions: string;
}

export interface DiseaseFeedback {
    diagnosisId: string;
    wasAccurate: boolean;
    actualDisease?: string;
    comments?: string;
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

    // Pesticide Management
    createPesticide: async (pesticide: Partial<Pesticide>) => {
        const response = await api.post(DISEASE_ENDPOINTS.PESTICIDES, pesticide);
        return response.data;
    },

    getAllPesticides: async () => {
        const response = await api.get(DISEASE_ENDPOINTS.PESTICIDES);
        return response.data;
    },

    getAllDiseases: async () => {
        const response = await api.get(DISEASE_ENDPOINTS.BASE);
        return response.data;
    },

    createDisease: async (disease: any) => {
        const response = await api.post(DISEASE_ENDPOINTS.BASE, disease);
        return response.data;
    },

    getPesticides: async () => {
        const response = await api.get(DISEASE_ENDPOINTS.PESTICIDES);
        return response.data;
    },

    linkPesticide: async (diseaseId: string, data: { pesticideId: string; dosage: string; interval: number; isPrimary: boolean }) => {
        if (!diseaseId || diseaseId === 'undefined') throw new Error('Invalid Disease ID');
        if (!data.pesticideId || data.pesticideId === 'undefined') throw new Error('Invalid Pesticide ID');

        await api.post(DISEASE_ENDPOINTS.LINK_PESTICIDE(diseaseId), null, {
            params: data
        });
    },

    sendSignal: async (payload: any) => {
        const response = await api.post(DISEASE_ENDPOINTS.REPORT_SIGNAL, payload);
        return response.data;
    },

    // Disease Feedback
    submitDiseaseFeedback: async (feedback: DiseaseFeedback) => {
        await api.post(DISEASE_ENDPOINTS.FEEDBACK, feedback);
    },

    getDiagnosisHistory: async (page = 0, size = 10) => {
        const response = await api.get(DIAGNOSIS_ENDPOINTS.HISTORY, {
            params: { page, size }
        });
        return response.data;
    }
};

export default advisoryService;
