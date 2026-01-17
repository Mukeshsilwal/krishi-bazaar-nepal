import api from './api';
import { AGRICULTURE_CALENDAR_ENDPOINTS } from '../config/endpoints';

export interface AgricultureCalendarEntry {
    id: string;
    crop: string;
    nepaliMonth: string;
    activityType: string;
    region?: string;
    advisory: string;
    active: boolean;
}

export const agricultureCalendarService = {
    getAllEntries: async (crop?: string, month?: string) => {
        const params = { size: 100 };
        if (crop) params['crop'] = crop;
        if (month) params['month'] = month;

        const response = await api.get(AGRICULTURE_CALENDAR_ENDPOINTS.PUBLIC_BASE, { params });
        return response.data;
    },

    createEntry: async (data: Partial<AgricultureCalendarEntry>) => {
        const response = await api.post(AGRICULTURE_CALENDAR_ENDPOINTS.ADMIN_BASE, data);
        return response.data;
    },

    updateEntry: async (id: string, data: Partial<AgricultureCalendarEntry>) => {
        const response = await api.put(AGRICULTURE_CALENDAR_ENDPOINTS.ADMIN_BY_ID(id), data);
        return response.data;
    },

    deleteEntry: async (id: string) => {
        await api.delete(AGRICULTURE_CALENDAR_ENDPOINTS.ADMIN_BY_ID(id));
    }
};
