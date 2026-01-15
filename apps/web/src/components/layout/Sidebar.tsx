import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home,
    ShoppingBag,
    Newspaper,
    ShoppingCart,
    Settings,
    BarChart3,
    Sprout,
    Package,
    Truck,
    Store,
    CalendarDays,
    Wallet,
    BrainCircuit,
    ShieldAlert
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/modules/auth/context/AuthContext';

const Sidebar = () => {
    const { language } = useLanguage();
    const { user } = useAuth();

    const navItems = [
        { icon: Home, label: 'Home', labelNe: 'गृहपृष्ठ', path: '/' },
        { icon: Store, label: 'Marketplace', labelNe: 'हाट बजार', path: '/marketplace' },
        { icon: BarChart3, label: 'Prices', labelNe: 'बजार भाउ', path: '/market-prices' },
        { icon: CalendarDays, label: 'Calendar', labelNe: 'पात्रो', path: '/agriculture-calendar' },
        { icon: Sprout, label: 'Advisory', labelNe: 'सल्लाह', path: '/diagnosis' },
        { icon: ShoppingBag, label: 'Agri Store', labelNe: 'कृषि पसल', path: '/agri-store' },
        { icon: Package, label: 'My Orders', labelNe: 'मेरा अर्डरहरू', path: '/my-orders' },
        { icon: Truck, label: 'Logistics', labelNe: 'ढुवानी', path: '/logistics' },
        { icon: ShoppingCart, label: 'Cart', labelNe: 'झोला', path: '/cart' },
        { icon: Newspaper, label: 'News/Schemes', labelNe: 'समाचार/योजना', path: '/knowledge' },
    ];

    if (user) {
        navItems.push({ icon: Wallet, label: 'Finance', labelNe: 'वित्त', path: '/finance' });
        navItems.push({ icon: BrainCircuit, label: 'AI Assistant', labelNe: 'AI सहायक', path: '/ai-assistant' });
        // Added for easier access to feedback
        navItems.push({ icon: ShieldAlert, label: 'My Advisories', labelNe: 'मेरो सल्लाह', path: '/advisory-history' });
    }

    if (user?.role === 'ADMIN') {
        navItems.push({ icon: ShieldAlert, label: 'Admin', labelNe: 'एडमिन', path: '/admin/dashboard' });
    }

    return (
        <aside className="hidden lg:flex flex-col w-20 bg-green-800 text-white rounded-r-3xl my-4 py-6 items-center gap-6 sticky top-24 h-[calc(100vh-8rem)]">
            {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                    <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) => `
                            p-3 rounded-xl transition-all duration-200 group relative
                            ${isActive ? 'bg-white/20 text-white shadow-inner' : 'hover:bg-white/10 text-green-100'}
                        `}
                        title={language === 'ne' ? item.labelNe : item.label}
                    >
                        <Icon size={24} />
                        <span className="sr-only">{language === 'ne' ? item.labelNe : item.label}</span>

                        {/* Tooltip */}
                        <div className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            {language === 'ne' ? item.labelNe : item.label}
                        </div>
                    </NavLink>
                );
            })}

            <div className="mt-auto">
                <NavLink
                    to="/settings"
                    className={({ isActive }) => `
                        p-3 rounded-xl transition-all duration-200 block
                        ${isActive ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-green-100'}
                    `}
                    title="Settings"
                >
                    <Settings size={24} />
                    <span className="sr-only">Settings</span>
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;
