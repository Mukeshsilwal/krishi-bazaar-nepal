/**
 * DashboardCard - Reusable card component for rural-first dashboard
 * Features: Large icons, Nepali text, touch-friendly, color-coded
 */

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    onClick?: () => void;
    priority?: 'critical' | 'high' | 'medium' | 'low' | 'normal';
    badge?: string | number;
    className?: string;
}

const priorityStyles = {
    critical: 'border-red-300 bg-red-50 hover:bg-red-100',
    high: 'border-orange-300 bg-orange-50 hover:bg-orange-100',
    medium: 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100',
    low: 'border-green-300 bg-green-50 hover:bg-green-100',
    normal: 'border-green-300 bg-green-50 hover:bg-green-100',
};

const iconStyles = {
    critical: 'text-red-600',
    high: 'text-orange-600',
    medium: 'text-yellow-600',
    low: 'text-green-600',
    normal: 'text-green-600',
};

export default function DashboardCard({
    icon: Icon,
    title,
    subtitle,
    onClick,
    priority = 'normal',
    badge,
    className,
}: DashboardCardProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'relative w-full touch-target-large rounded-2xl border-2 p-6',
                'transition-all duration-200 active:scale-95',
                'shadow-soft hover:shadow-medium',
                'flex flex-col items-center justify-center gap-3',
                priorityStyles[priority],
                className
            )}
        >
            {/* Badge for urgent alerts */}
            {badge && (
                <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                    {badge}
                </span>
            )}

            {/* Large Icon */}
            <Icon className={cn('w-12 h-12', iconStyles[priority])} />

            {/* Title */}
            <h3 className="text-heading-readable font-bold text-gray-900 text-center">
                {title}
            </h3>

            {/* Subtitle */}
            {subtitle && (
                <p className="text-readable text-gray-600 text-center">
                    {subtitle}
                </p>
            )}
        </button>
    );
}
