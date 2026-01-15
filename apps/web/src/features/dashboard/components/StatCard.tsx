import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';

/**
 * Reusable dashboard stat card component with loading and empty states.
 *
 * Design Notes:
 * - Supports skeleton loading for better perceived performance on slow networks.
 * - Empty state (when value is "0") shows a call-to-action link to encourage engagement.
 * - Trend indicator shows percentage change with color-coded arrows.
 *
 * Important:
 * - Empty state only shows when value is exactly "0" AND emptyStateLink is provided.
 * - This prevents showing empty state for legitimate zero values (e.g., "0 pending orders").
 * - Skeleton loader uses same layout as actual content to prevent layout shift.
 */
interface StatCardProps {
    titleEn: string;
    titleNe: string;
    value: string;
    subValue?: string;
    trend?: number;
    icon: React.ReactNode;
    variant?: 'default' | 'primary';
    loading?: boolean;
    emptyStateLink?: string;
    emptyStateTextEn?: string;
    emptyStateTextNe?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    titleEn,
    titleNe,
    value,
    subValue,
    trend,
    icon,
    variant = 'default',
    loading = false,
    emptyStateLink,
    emptyStateTextEn,
    emptyStateTextNe
}) => {
    const { language } = useLanguage();
    const isPrimary = variant === 'primary';

    // Skeleton loading state
    if (loading) {
        return (
            <div className={`rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-full shadow-sm animate-pulse ${isPrimary ? 'bg-green-700' : 'bg-white'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${isPrimary ? 'bg-white/20' : 'bg-gray-200'} w-12 h-12`}></div>
                </div>
                <div>
                    <div className={`h-4 rounded w-20 mb-2 ${isPrimary ? 'bg-white/20' : 'bg-gray-200'}`}></div>
                    <div className={`h-8 rounded w-16 mb-1 ${isPrimary ? 'bg-white/30' : 'bg-gray-300'}`}></div>
                    <div className={`h-3 rounded w-24 ${isPrimary ? 'bg-white/20' : 'bg-gray-200'}`}></div>
                </div>
            </div>
        );
    }

    // Empty state when value is "0" and empty state link is provided
    const showEmptyState = value === '0' && emptyStateLink;

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
                {showEmptyState ? (
                    <Link
                        to={emptyStateLink}
                        className={`text-xs mt-2 inline-flex items-center gap-1 hover:underline ${isPrimary ? 'text-green-200' : 'text-green-600'}`}
                    >
                        {language === 'ne' ? (emptyStateTextNe || 'बजार हेर्नुहोस् →') : (emptyStateTextEn || 'Explore marketplace →')} 🌱
                    </Link>
                ) : subValue && (
                    <div className={`text-xs mt-1 ${isPrimary ? 'text-green-200' : 'text-gray-400'}`}>
                        {subValue}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;

