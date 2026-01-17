import NepaliDate from 'nepali-date-converter';

// Existing formatting functions
export const formatDate = (date: Date | string | number): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        throw new Error('Invalid date provided to formatDate');
    }
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatDateTime = (date: Date | string | number): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        return 'Invalid Date';
    }
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Converts a Gregorian date to Nepali date (BS)
 */
export const toNepaliDate = (date: Date | string | number): string => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid Date';
        const nepaliDate = new NepaliDate(d);
        return nepaliDate.format('YYYY-MM-DD');
    } catch (e) {
        return 'Error';
    }
};

/**
 * Formats a date to Nepali date with full name of month and day
 */
export const formatNepaliDateLong = (date: Date | string | number): string => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid Date';
        const nepaliDate = new NepaliDate(d);
        return nepaliDate.format('YYYY MMMM DD, dddd');
    } catch (e) {
        return 'Error';
    }
};

/**
 * Converts BS to AD
 */
export const toGregorianDate = (nepaliYear: number, nepaliMonth: number, nepaliDay: number): Date => {
    const nepaliDate = new NepaliDate(nepaliYear, nepaliMonth, nepaliDay);
    return nepaliDate.toJsDate();
};

export const fromApiDate = (dateStr: string): Date => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
        throw new Error(`Invalid API date string: ${dateStr}`);
    }
    return d;
};
