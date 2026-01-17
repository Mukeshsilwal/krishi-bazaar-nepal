import React from 'react';
import { formatDate, formatNepaliDateLong } from '@krishihub/common-utils';

interface DateDisplayProps {
    date: Date | string | number;
    format?: 'short' | 'long';
    showNepali?: boolean;
    className?: string;
}

/**
 * Display component that shows both Gregorian and Nepali dates.
 */
const DateDisplay: React.FC<DateDisplayProps> = ({
    date,
    format = 'short',
    showNepali = true,
    className = ''
}) => {
    if (!date) return null;

    const gregorianDate = formatDate(date);
    const nepaliDate = showNepali ? formatNepaliDateLong(date) : null;

    return (
        <div className={`flex flex-col ${className}`}>
            <span className="font-medium text-foreground">
                {gregorianDate}
            </span>
            {showNepali && nepaliDate && (
                <span className="text-xs text-muted-foreground italic">
                    {nepaliDate}
                </span>
            )}
        </div>
    );
};

export default DateDisplay;
