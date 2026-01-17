import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/services/api';

/**
 * Provides global access to system settings (company info, hero text, etc.).
 *
 * Design Notes:
 * - Settings are fetched once at app startup and cached in React state.
 * - Only public settings are exposed via `/public/settings` endpoint.
 * - This prevents multiple API calls for static configuration data.
 *
 * Important:
 * - Settings are loaded asynchronously; components should handle loading state.
 * - If settings fail to load, empty object is used as fallback.
 * - refreshSettings() can be called to manually reload settings if needed.
 */
interface SettingsContextType {
    settings: Record<string, string>;
    loading: boolean;
    refreshSettings: () => Promise<void>;
    getSetting: (key: string, defaultValue?: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/public/settings');

            // Check for success code (standardized API response)
            if (response.data.code === 0 || response.data.success) {
                const responseData = response.data.data;

                let settingsMap: Record<string, string> = {};

                // Case 1: Paginated Response (has content array)
                if (responseData && responseData.content && Array.isArray(responseData.content)) {
                    responseData.content.forEach((setting: any) => {
                        if (setting.key && setting.value) {
                            settingsMap[setting.key] = setting.value;
                        }
                    });
                }
                // Case 2: Array Response
                else if (Array.isArray(responseData)) {
                    responseData.forEach((setting: any) => {
                        if (setting.key && setting.value) {
                            settingsMap[setting.key] = setting.value;
                        }
                    });
                }
                // Case 3: Direct Map/Object Response (e.g., { "KEY": "Value" })
                else if (typeof responseData === 'object' && responseData !== null) {
                    settingsMap = responseData;
                }

                setSettings(settingsMap);
            } else {
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const getSetting = (key: string, defaultValue: string = '') => {
        return settings[key] || defaultValue;
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings, getSetting }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
