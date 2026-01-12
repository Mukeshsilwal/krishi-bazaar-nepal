import { useState, useEffect } from 'react';
import api from '../services/api';
import { MASTER_DATA_ENDPOINTS } from '@/config/endpoints';
import { useLanguage } from '../context/LanguageContext';

export interface MasterItem {
    code: string;
    labelEn: string;
    labelNe: string;
    sortOrder: number;
}

export function useMasterData(categoryCode: string) {
    const [data, setData] = useState<MasterItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { language } = useLanguage();

    useEffect(() => {
        if (!categoryCode) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Determine cache key based on category
                const cacheKey = `master-data-${categoryCode}`;
                const cached = sessionStorage.getItem(cacheKey);

                if (cached) {
                    const parsed = JSON.parse(cached);
                    // Simple expiry check could be added here
                    setData(parsed);
                    setLoading(false);
                    return; // Return early if cached
                }

                const response = await api.get(MASTER_DATA_ENDPOINTS.BY_CODE_V1(categoryCode));
                if (response.data.success) {
                    const items = response.data.data.data;
                    setData(items);
                    sessionStorage.setItem(cacheKey, JSON.stringify(items));
                }
            } catch (err: any) {
                console.error(`Failed to fetch master data for ${categoryCode}`, err);
                setError(err.message || 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryCode]);

    const getLabel = (code: string) => {
        const item = data.find(d => d.code === code);
        if (!item) return code;
        return language === 'ne' ? (item.labelNe || item.labelEn) : item.labelEn;
    };

    return { data, loading, error, getLabel };
}
