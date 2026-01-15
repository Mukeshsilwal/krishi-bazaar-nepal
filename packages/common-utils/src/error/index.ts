export interface ApiErrorResponse {
    message?: string;
    code?: string;
    details?: any;
}

export interface ErrorResolutionOptions {
    fallbackMessage?: string;
    language?: 'en' | 'ne';
}

export function resolveErrorMessage(error: any, options: ErrorResolutionOptions = {}): string {
    const { fallbackMessage = "Something went wrong. Please try again.", language = 'en' } = options;

    // Network errors (Axios style)
    if (!error?.response) {
        // Simple check for network error
        if (error?.message === 'Network Error' || error?.code === 'ERR_NETWORK') {
            return language === 'ne'
                ? "इन्टरनेट जडान जाँच गर्नुहोस्"
                : "Unable to connect. Please check your internet connection.";
        }
    }

    const data = error?.response?.data;

    // 1. Check for valid backend user message
    if (data?.message) {
        return data.message;
    }

    // 2. Fallback based on HTTP Status Codes
    const status = error?.response?.status;
    switch (status) {
        case 400:
            return language === 'ne' ? "कृपया प्रविष्ट गरिएको जानकारी जाँच गर्नुहोस्" : "Please check the entered information";
        case 401:
            return language === 'ne' ? "सत्र समाप्त भयो। कृपया फेरि लग इन गर्नुहोस्" : "Session expired. Please login again";
        case 403:
            return language === 'ne' ? "तपाईंलाई यो कार्य गर्न अनुमति छैन" : "You are not allowed to perform this action";
        case 404:
            return language === 'ne' ? "माग गरिएको जानकारी भेटिएन" : "Requested information not found";
        case 500:
            return language === 'ne' ? "प्रणाली अस्थायी रूपमा अनुपलब्ध छ" : "System is temporarily unavailable";
        default:
            return fallbackMessage;
    }
}
