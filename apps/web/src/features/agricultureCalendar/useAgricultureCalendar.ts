import { useState, useEffect, useCallback } from 'react';
import { agricultureCalendarService, AgricultureCalendarEntry } from '../../services/agricultureCalendarService';
import { toast } from 'sonner';

export const useAgricultureCalendar = () => {
    const [entries, setEntries] = useState<AgricultureCalendarEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [errorState, setErrorState] = useState<string | null>(null);

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        try {
            const data = await agricultureCalendarService.getAllEntries(
                selectedCrop || undefined,
                selectedMonth || undefined
            );

            // Handle paginated response structure
            if (data && data.content && Array.isArray(data.content)) {
                setEntries(data.content);
            } else if (Array.isArray(data)) {
                setEntries(data);
            } else {
                // Fallback or empty
                setEntries([]);
            }

            setErrorState(null);
        } catch (error) {
            console.error('Failed to fetch calendar entries:', error);
            const msg = 'कुषि क्यालेन्डर लोड गर्न समस्या भयो।';
            setErrorState(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [selectedCrop, selectedMonth]);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    return {
        entries,
        loading,
        error: errorState,
        selectedCrop,
        setSelectedCrop,
        selectedMonth,
        setSelectedMonth,
        refresh: fetchEntries
    };
};
