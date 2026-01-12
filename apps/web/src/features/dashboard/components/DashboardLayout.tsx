import React from 'react';
import DashboardSidebar from './DashboardSidebar';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { user } = useAuth();
    const { language } = useLanguage();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (language === 'ne') {
            return 'नमस्ते';
        }
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="flex bg-gray-50 min-h-[calc(100vh-64px)]">
            <DashboardSidebar />

            <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header Greeting */}
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {getGreeting()}, <span className="text-green-700">{user?.name || (language === 'ne' ? 'किसान मित्र' : 'Farmer Friend')}!</span>
                        </h1>
                        <p className="text-gray-500 mt-2">
                            {language === 'ne'
                                ? 'आजको बजार मूल्य र कृषि जानकारी यहाँ पाउनुहोस्'
                                : 'Find today\'s market prices and agri-updates here.'}
                        </p>
                    </header>

                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
