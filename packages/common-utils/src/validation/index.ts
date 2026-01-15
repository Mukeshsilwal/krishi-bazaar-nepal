/**
 * Centralized Validation utility.
 */

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
    // Basic validation for Nepal phone numbers (starts with 9, 10 digits) or generic
    const phoneRegex = /^(9\d{9})$/;
    return phoneRegex.test(phone);
};
