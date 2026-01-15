import { useState, useEffect } from 'react';
import api from '../services/api';

interface SystemSettings {
    COMPANY_NAME?: string;
    COMPANY_TAGLINE?: string;
    COMPANY_EMAIL?: string;
    COMPANY_PHONE?: string;
    COMPANY_LOCATION?: string;
    SOCIAL_FACEBOOK?: string;
    SOCIAL_YOUTUBE?: string;
    [key: string]: string | undefined;
}

export const useSettings = () => {
    const [settings, setSettings] = useState<SystemSettings>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/public/settings');
                if (res.data.code === 0) {
                    setSettings(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return { settings, loading };
};
