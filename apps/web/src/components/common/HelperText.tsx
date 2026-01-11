/**
 * HelperText - Reusable helper text component
 * Displays contextual help below form fields or actions
 * Color-coded by variant for different message types
 */

import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface HelperTextProps {
    text: string;
    variant?: 'info' | 'success' | 'warning' | 'error';
    className?: string;
}

const variantStyles = {
    info: 'text-blue-700',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    error: 'text-red-700',
};

const variantIcons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
};

export default function HelperText({
    text,
    variant = 'info',
    className,
}: HelperTextProps) {
    const Icon = variantIcons[variant];

    return (
        <div
            className={cn(
                'flex items-start gap-2 mt-2',
                'helper-text',
                variantStyles[variant],
                className
            )}
        >
            <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed">{text}</p>
        </div>
    );
}
