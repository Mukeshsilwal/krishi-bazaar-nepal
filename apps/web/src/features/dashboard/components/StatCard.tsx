import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface StatCardProps {
    titleEn: string;
    titleNe: string;
    value: string;
    subValue?: string;
    trend?: number;
    icon: React.ReactNode;
    variant?: 'default' | 'primary';
}

const StatCard: React.FC<StatCardProps> = ({
    titleEn,
    titleNe,
    value,
    subValue,
    trend,
    icon,
    variant = 'default'
}) => {
    const { language } = useLanguage();
    const isPrimary = variant === 'primary';

    return (
        <div className={`rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-full shadow-sm ${isPrimary ? 'bg-green-700 text-white' : 'bg-white text-gray-800'
            }`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${isPrimary ? 'bg-white/20' : 'bg-green-50 text-green-700'}`}>
                    {icon}
                </div>
                {trend !== undefined && (
                    <div className={`text-xs font-medium flex items-center ${trend > 0 ? (isPrimary ? 'text-green-200' : 'text-green-600') : 'text-red-500'
                        }`}>
                        {trend > 0 ? <ArrowUp size={12} className="mr-0.5" /> : <ArrowDown size={12} className="mr-0.5" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>

            <div>
                <h4 className={`text-sm font-medium mb-1 ${isPrimary ? 'text-green-100' : 'text-gray-500'}`}>
                    {language === 'ne' ? titleNe : titleEn}
                </h4>
                <div className="text-2xl font-bold">{value}</div>
                {subValue && (
                    <div className={`text-xs mt-1 ${isPrimary ? 'text-green-200' : 'text-gray-400'}`}>
                        {subValue}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
