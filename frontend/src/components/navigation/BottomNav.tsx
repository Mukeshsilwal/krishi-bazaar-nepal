/**
 * BottomNav - Mobile-first bottom navigation for rural users
 * Features: Large touch targets, icons + Nepali labels, sticky positioning
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { icons } from '@/constants/icons';
import { cn } from '@/lib/utils';

const navItems = [
    {
        key: 'home',
        icon: icons.nav.home,
        labelKey: 'bottomNav.home',
        path: '/',
    },
    {
        key: 'alerts',
        icon: icons.nav.notifications,
        labelKey: 'bottomNav.alerts',
        path: '/notifications',
    },
    {
        key: 'diagnose',
        icon: icons.disease.diagnosis,
        labelKey: 'bottomNav.diagnose',
        path: '/diagnosis',
    },
    {
        key: 'knowledge',
        icon: icons.nav.knowledge,
        labelKey: 'bottomNav.knowledge',
        path: '/knowledge',
    },
    {
        key: 'profile',
        icon: icons.nav.profile,
        labelKey: 'bottomNav.profile',
        path: '/profile',
    },
];

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-medium md:hidden">
            <div className="grid grid-cols-5 gap-1 px-2 py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <button
                            key={item.key}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1',
                                'touch-target rounded-lg transition-all duration-200',
                                'active:scale-95',
                                isActive
                                    ? 'bg-green-50 text-green-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                            )}
                        >
                            <Icon
                                className={cn(
                                    'w-6 h-6',
                                    isActive ? 'text-green-600' : 'text-gray-500'
                                )}
                            />
                            <span
                                className={cn(
                                    'text-xs font-medium',
                                    isActive ? 'text-green-700' : 'text-gray-600'
                                )}
                            >
                                {t(item.labelKey)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
