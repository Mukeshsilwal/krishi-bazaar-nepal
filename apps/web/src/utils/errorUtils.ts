export function resolveUserMessage(error: any): string {
    // Network errors
    if (!error?.response) {
        return "Unable to connect. Please check your internet connection.";
    }

    const data = error.response?.data;

    // 1. Check for valid backend user message (Unified Contract)
    // We prioritize 'message' field which is now guaranteed to be user-friendly
    if (data?.message) {
        return data.message;
    }

    // 2. Fallback based on HTTP Status Codes
    const status = error.response.status;
    switch (status) {
        case 400:
            return "Please check the entered information";
        case 401:
            return "Session expired. Please login again";
        case 403:
            return "You are not allowed to perform this action";
        case 404:
            return "Requested information not found"; // Nepali: माग गरिएको जानकारी भेटिएन
        case 500:
            return "System is temporarily unavailable"; // Nepali: प्रणाली अस्थायी रूपमा अनुपलब्ध छ
        default:
            return "Something went wrong. Please try again.";
    }
}
