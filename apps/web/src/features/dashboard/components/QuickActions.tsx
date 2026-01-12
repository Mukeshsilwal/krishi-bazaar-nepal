import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { BarChart3, Sprout, ShoppingBag, BookOpen } from 'lucide-react';

const QuickActions = () => {
    const { language } = useLanguage();

    const actions = [
        {
            titleEn: 'Market Prices',
            titleNe: 'बजार मूल्य',
            icon: BarChart3,
            color: 'text-green-600',
            bg: 'bg-green-50',
            link: '/market-prices'
        },
        {
            titleEn: 'Agri Advisory',
            titleNe: 'कृषि जाँच',
            icon: Sprout,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            link: '/diagnosis'
        },
        {
            titleEn: 'Agri Store',
            titleNe: 'कृषि सामग्री',
            icon: ShoppingBag,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            link: '/agri-store'
        },
        {
            titleEn: 'Knowledge',
            titleNe: 'जानकारी',
            icon: BookOpen,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            link: '/knowledge'
        }
    ];

    return (
        <section className="py-2">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
                {language === 'ne' ? 'द्रुत सेवाहरू' : 'Quick Services'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {actions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={index}
                            to={action.link}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center text-center group"
                        >
                            <div className={`w-12 h-12 ${action.bg} rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className={`w-6 h-6 ${action.color}`} />
                            </div>
                            <span className="font-medium text-gray-700">
                                {language === 'ne' ? action.titleNe : action.titleEn}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default QuickActions;
