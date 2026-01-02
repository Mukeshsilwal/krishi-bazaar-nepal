/**
 * Centralized API endpoint configuration for the KrishiHub frontend.
 * All API endpoints are defined here to maintain consistency and prevent typos.
 * 
 * Note: These paths are relative to the API base URL configured in api.js
 * The actual base URL is set in config/app.js
 */

// ==================== Authentication & Authorization ====================

export const AUTH_ENDPOINTS = {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ADMIN_LOGIN: '/auth/admin/login',
    ADMIN_REGISTER: '/auth/admin/register',
    VERIFY_OTP: '/auth/verify-otp',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
};

// ==================== Marketplace & Listings ====================

export const MARKETPLACE_ENDPOINTS = {
    LISTINGS: '/listings',
    LISTING_BY_ID: (id) => `/listings/${id}`,
    MY_LISTINGS: '/listings/my',
    UPLOAD_IMAGE: (id) => `/listings/${id}/images`,
    CROPS: '/listings/crops',
};

// ==================== Orders & Payments ====================

export const ORDER_ENDPOINTS = {
    ORDERS: '/orders',
    ORDER_BY_ID: (id) => `/orders/${id}`,
    MY_PURCHASES: '/orders/my/purchases',
    MY_SALES: '/orders/my/sales',
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
    CANCEL: (id) => `/orders/${id}/cancel`,
};

export const PAYMENT_ENDPOINTS = {
    INITIATE: '/payments/initiate',
    VERIFY: '/payments/verify',
    ESEWA_SUCCESS: '/payments/esewa/success',
    ESEWA_FAILURE: '/payments/esewa/failure',
};

// ==================== Knowledge & Content Management ====================

export const KNOWLEDGE_ENDPOINTS = {
    BASE: '/knowledge',
    BY_ID: (id) => `/knowledge/${id}`,
    SEARCH: '/knowledge/search',
    BY_CATEGORY: (category) => `/knowledge/category/${category}`,
    CATEGORIES: '/knowledge/categories',

    // Moderation
    MODERATION_QUEUE: '/knowledge/moderation/queue',
    APPROVE: (id) => `/knowledge/moderation/${id}/approve`,
    REJECT: (id) => `/knowledge/moderation/${id}/reject`,

    // Sources
    SOURCES: '/knowledge/sources',
    SOURCE_BY_ID: (id) => `/knowledge/sources/${id}`,
};

export const CONTENT_ENDPOINTS = {
    BASE: '/admin/content',
    BY_ID: (id) => `/admin/content/${id}`,
    PUBLISH: (id) => `/admin/content/${id}/publish`,
};

export const CMS_ENDPOINTS = {
    CONTENT: '/admin/cms/content',
    CONTENT_BY_ID: (id) => `/admin/cms/content/${id}`,
};

// ==================== Advisory & Weather ====================

export const ADVISORY_ENDPOINTS = {
    BASE: '/advisory',
    BY_ID: (id) => `/advisory/${id}`,
    MY: '/advisory/my',
};

export const WEATHER_ENDPOINTS = {
    CURRENT: '/weather/current',
    FORECAST: '/weather/forecast',
    BY_LOCATION: '/weather/location',
};

export const WEATHER_ADVISORY_ENDPOINTS = {
    BASE: '/weather-advisories',
    BY_ID: (id) => `/weather-advisories/${id}`,
    MY: '/weather-advisories/my',
};

export const ADVISORY_LOG_ENDPOINTS = {
    BASE: '/advisory-logs',
    BY_ID: (id) => `/advisory-logs/${id}`,
    BY_FARMER: (farmerId) => `/advisory-logs/farmer/${farmerId}`,
    STATS: '/advisory-logs/stats',
};

export const RULE_ENDPOINTS = {
    BASE: '/admin/rules',
    BY_ID: (id) => `/admin/rules/${id}`,
    SIMULATE: '/admin/rules/simulate',
};

// ==================== AI & Diagnosis ====================

export const AI_ENDPOINTS = {
    CHAT: '/ai/chat',
    DIAGNOSE: '/ai/diagnose',
};

export const DIAGNOSIS_ENDPOINTS = {
    BASE: '/diagnoses',
    BY_ID: (id) => `/diagnoses/${id}`,
    MY: '/diagnoses/my',
    FEEDBACK: (id) => `/diagnoses/${id}/feedback`,
};

export const ADMIN_DIAGNOSIS_ENDPOINTS = {
    PENDING: '/admin/diagnosis/pending',
    REVIEW: (id) => `/admin/diagnosis/${id}/review`,
    STATS: '/admin/diagnosis/stats',
};

export const DISEASE_ENDPOINTS = {
    BASE: '/diseases',
    BY_ID: (id) => `/diseases/${id}`,
    SEARCH: '/diseases/search',
    BY_CROP: (cropName) => `/diseases/crop/${cropName}`,

    // Signals
    SIGNALS: '/disease/signals',
    REPORT_SIGNAL: '/disease/signals/report',
};

// ==================== Finance & Subsidies ====================

export const FINANCE_ENDPOINTS = {
    LOANS: '/finance/loans',
    LOAN_BY_ID: (id) => `/finance/loans/${id}`,
    APPLY_LOAN: '/finance/loans/apply',
};

export const SUBSIDY_ENDPOINTS = {
    BASE: '/subsidies',
    BY_ID: (id) => `/subsidies/${id}`,
    ELIGIBLE: '/subsidies/eligible',
};

export const SCHEME_ENDPOINTS = {
    BASE: '/schemes',
    BY_ID: (id) => `/schemes/${id}`,
    ACTIVE: '/schemes/active',
};

// ==================== Logistics & Cold Storage ====================

export const LOGISTICS_ENDPOINTS = {
    PROVIDERS: '/logistics/providers',
    QUOTE: '/logistics/quote',
    BOOK: '/logistics/book',
    TRACK: (id) => `/logistics/track/${id}`,
};

export const COLD_STORAGE_ENDPOINTS = {
    BASE: '/cold-storage',
    BY_ID: (id) => `/cold-storage/${id}`,
    NEARBY: '/cold-storage/nearby',
    BOOK: '/cold-storage/book',
};

// ==================== Messaging & Notifications ====================

export const MESSAGE_ENDPOINTS = {
    SEND: '/messages',
    CONVERSATIONS: '/messages/conversations',
    CONVERSATION: (userId) => `/messages/${userId}`,
    UNREAD_COUNT: '/messages/unread/count',
    PRESENCE: '/messages/presence',
    MARK_READ: (userId) => `/messages/${userId}/read`,
};

export const NOTIFICATION_ENDPOINTS = {
    BASE: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    UNREAD_COUNT: '/notifications/unread/count',
};

export const ADMIN_NOTIFICATION_ENDPOINTS = {
    SEND: '/admin/notifications/send',
    BROADCAST: '/admin/notifications/broadcast',
    HISTORY: '/admin/notifications/history',
};

// ==================== Market Prices ====================

export const MARKET_PRICE_ENDPOINTS = {
    BASE: '/market-prices',
    LATEST: '/market-prices/latest',
    BY_CROP: (cropName) => `/market-prices/crop/${cropName}`,
    TRENDS: '/market-prices/trends',
};

export const MARKET_ENDPOINTS = {
    BASE: '/markets',
    BY_ID: (id) => `/markets/${id}`,
};

export const PRICE_ALERT_ENDPOINTS = {
    BASE: '/price-alerts',
    BY_ID: (id) => `/price-alerts/${id}`,
};

// ==================== Admin & Analytics ====================

export const ADMIN_ENDPOINTS = {
    DASHBOARD: '/admin/dashboard',
    STATS: '/admin/stats',

    // Users
    USERS: '/admin/users',
    USER_BY_ID: (id) => `/admin/users/${id}`,

    // Farmers
    FARMERS: '/admin/farmers',
    FARMER_BY_ID: (id) => `/admin/farmers/${id}`,
    VERIFY_FARMER: (id) => `/admin/farmers/${id}/verify`,

    // Analytics
    ANALYTICS_OVERVIEW: '/admin/analytics/overview',
    ANALYTICS_USERS: '/admin/analytics/users',
    ANALYTICS_MARKETPLACE: '/admin/analytics/marketplace',
    ANALYTICS_REVENUE: '/admin/analytics/revenue',

    // RBAC
    RBAC_ROLES: '/admin/rbac/roles',
    RBAC_PERMISSIONS: '/admin/rbac/permissions',
    RBAC_ASSIGN: '/admin/rbac/assign',

    // Health
    HEALTH_STATUS: '/admin/health/status',
    HEALTH_INTEGRATIONS: '/admin/health/integrations',

    // Settings
    SETTINGS: '/admin/settings',
    SETTING_BY_KEY: (key) => `/admin/settings/${key}`,
};

// ==================== Master Data ====================

export const MASTER_DATA_ENDPOINTS = {
    DISTRICTS: '/districts',
    CROPS: '/crops',
    UNITS: '/units',

    // Admin endpoints
    ADMIN_CROPS: '/admin/master-data/crops',
    ADMIN_DISTRICTS: '/admin/master-data/districts',
};

// ==================== Support & Feedback ====================

export const FEEDBACK_ENDPOINTS = {
    SUBMIT: '/feedback/submit',
    BASE: '/feedback',
};

// ==================== Default Export ====================

export default {
    AUTH: AUTH_ENDPOINTS,
    MARKETPLACE: MARKETPLACE_ENDPOINTS,
    ORDER: ORDER_ENDPOINTS,
    PAYMENT: PAYMENT_ENDPOINTS,
    KNOWLEDGE: KNOWLEDGE_ENDPOINTS,
    CONTENT: CONTENT_ENDPOINTS,
    CMS: CMS_ENDPOINTS,
    ADVISORY: ADVISORY_ENDPOINTS,
    WEATHER: WEATHER_ENDPOINTS,
    WEATHER_ADVISORY: WEATHER_ADVISORY_ENDPOINTS,
    ADVISORY_LOG: ADVISORY_LOG_ENDPOINTS,
    RULE: RULE_ENDPOINTS,
    AI: AI_ENDPOINTS,
    DIAGNOSIS: DIAGNOSIS_ENDPOINTS,
    ADMIN_DIAGNOSIS: ADMIN_DIAGNOSIS_ENDPOINTS,
    DISEASE: DISEASE_ENDPOINTS,
    FINANCE: FINANCE_ENDPOINTS,
    SUBSIDY: SUBSIDY_ENDPOINTS,
    SCHEME: SCHEME_ENDPOINTS,
    LOGISTICS: LOGISTICS_ENDPOINTS,
    COLD_STORAGE: COLD_STORAGE_ENDPOINTS,
    MESSAGE: MESSAGE_ENDPOINTS,
    NOTIFICATION: NOTIFICATION_ENDPOINTS,
    ADMIN_NOTIFICATION: ADMIN_NOTIFICATION_ENDPOINTS,
    MARKET_PRICE: MARKET_PRICE_ENDPOINTS,
    MARKET: MARKET_ENDPOINTS,
    PRICE_ALERT: PRICE_ALERT_ENDPOINTS,
    ADMIN: ADMIN_ENDPOINTS,
    MASTER_DATA: MASTER_DATA_ENDPOINTS,
    FEEDBACK: FEEDBACK_ENDPOINTS,
};
