/**
 * Centralized Date utility.
 * DO NOT create date logic elsewhere.
 * This is the single source of truth.
 */

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

// Placeholder for Nepali Date conversion logic
export const toNepaliDate = (date: Date | string): string => {
    // TODO: Implement actual Nepali date conversion or integrate a library if needed.
    // For now returning a placeholder to enforce API contract.
    return `NP-${formatDate(date)}`;
};

export const fromApiDate = (dateStr: string): Date => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
        throw new Error(`Invalid API date string: ${dateStr}`);
    }
    return d;
};
