import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminContextType {
    setTitle: (en: string, ne?: string) => void;
    title: string;
    titleNe?: string;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [title, setTitleState] = useState('');
    const [titleNe, setTitleNeState] = useState<string | undefined>('');

    const setTitle = (en: string, ne?: string) => {
        setTitleState(en);
        setTitleNeState(ne);
    };

    return (
        <AdminContext.Provider value={{ setTitle, title, titleNe }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdminTitle = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdminTitle must be used within an AdminProvider');
    }
    return context;
};
