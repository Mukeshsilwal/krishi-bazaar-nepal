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
    LOGOUT: '/auth/logout',
    ROLES: '/auth/roles',
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
    MY_ORDERS: '/orders/my',
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
    CANCEL: (id) => `/orders/${id}/cancel`,
};

export const PAYMENT_ENDPOINTS = {
    INITIATE: '/payments/initiate',
    VERIFY: '/payments/verify',
    ESEWA_SUCCESS: '/payments/esewa/success',
    ESEWA_FAILURE: '/payments/esewa/failure',
    BY_ID: (id) => `/payments/${id}`,
};

// ==================== Knowledge & Content Management ====================

export const KNOWLEDGE_ENDPOINTS = {
    BASE: '/knowledge',
    BY_ID: (id) => `/knowledge/${id}`,
    SEARCH: '/knowledge/search',
    BY_CATEGORY: (category) => `/knowledge/category/${category}`,
    CATEGORIES: '/knowledge/categories',

    // Articles
    ARTICLES: '/knowledge/articles',
    ARTICLE_BY_ID: (id) => `/knowledge/articles/${id}`,

    // Moderation
    MODERATION_QUEUE: '/knowledge/moderation/queue',
    MODERATION_PENDING: '/knowledge/moderation/pending',
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
    ARTICLES: '/admin/cms/articles',
    WORKFLOW: (id) => `/admin/cms/articles/${id}/workflow`,
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
    FEEDBACK: '/advisory-logs/feedback',
    OPENED: (id) => `/advisory-logs/opened/${id}`,
    ANALYTICS: '/advisory-logs/analytics',
    DISTRICT_RISK: '/advisory-logs/analytics/district-risk',
    ALERT_FATIGUE: '/advisory-logs/analytics/alert-fatigue',
    HIGH_RISK_DISTRICTS: '/advisory-logs/analytics/high-risk-districts',
    TOP_RULES: '/advisory-logs/analytics/top-rules',
    UNDERPERFORMING_RULES: '/advisory-logs/analytics/underperforming-rules',
    ENGAGEMENT_SCORE: '/advisory-logs/analytics/engagement-score',
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
    RECOMMENDATION: '/ai/recommendation',
};

export const DIAGNOSIS_ENDPOINTS = {
    BASE: '/diagnoses',
    BY_ID: (id) => `/diagnoses/${id}`,
    MY: '/diagnoses/my',
    FEEDBACK: (id) => `/diagnoses/${id}/feedback`,
    HISTORY: '/diagnoses/history',
};

export const ADMIN_DIAGNOSIS_ENDPOINTS = {
    PENDING: '/admin/diagnosis/pending',
    REVIEW: (id) => `/admin/diagnosis/${id}/review`,
    STATS: '/admin/diagnosis/stats',
    QUEUE: '/admin/diagnosis/queue',
};

export const DISEASE_ENDPOINTS = {
    BASE: '/diseases',
    BY_ID: (id) => `/diseases/${id}`,
    SEARCH: '/diseases/search',
    BY_CROP: (cropName) => `/diseases/crop/${cropName}`,

    // Signals
    SIGNALS: '/disease/signals',
    REPORT_SIGNAL: '/disease/signals/report',

    // Pesticides & Feedback
    PESTICIDES: '/diseases/pesticides',
    FEEDBACK: '/diseases/feedback',
    LINK_PESTICIDE: (id) => `/diseases/${id}/link-pesticide`,
};

// ==================== Finance & Subsidies ====================

export const FINANCE_ENDPOINTS = {
    LOANS: '/finance/loans',
    LOAN_BY_ID: (id) => `/finance/loans/${id}`,
    APPLY_LOAN: '/finance/loans/apply',
    INSURANCE: '/finance/insurance',
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
    SHIPMENT_BY_ORDER: (orderId) => `/logistics/shipments/${orderId}`,
    TRACK_BY_CODE: (code) => `/logistics/shipments/track/${code}`,
    UPDATE_STATUS: (id) => `/logistics/shipments/${id}/status`,
    // Legacy support
    TRACK: (id) => `/logistics/shipments/track/${id}`,
    STATUS: '/logistics/status',
};

export const COLD_STORAGE_ENDPOINTS = {
    BASE: '/logistics/cold-storages',
    BY_ID: (id) => `/logistics/cold-storages/${id}`,
    NEARBY: '/logistics/cold-storages/nearby',
    BOOK: '/logistics/cold-storages/book',
};

// ==================== Messaging & Notifications ====================

export const MESSAGE_ENDPOINTS = {
    BASE: '/chat',
    SEND: '/chat/message/send',
    CONVERSATIONS: '/chat/conversations',
    CONVERSATION: (id) => `/chat/conversation/${id}`,
    MESSAGES: '/chat/messages',
    CREATE_CONVERSATION: '/chat/conversation/create',
    UNREAD_COUNT: '/chat/unread/count',
    PRESENCE: '/chat/presence',
    MARK_READ: '/chat/message/read',
};

export const NOTIFICATION_ENDPOINTS = {
    BASE: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    UNREAD_COUNT: '/notifications/unread-count',
    TOKENS: '/notifications/tokens',
};

export const ADMIN_NOTIFICATION_ENDPOINTS = {
    BASE: '/admin/notifications',
    SEND: '/admin/notifications/send',
    BROADCAST: '/admin/notifications/broadcast',
    HISTORY: '/admin/notifications/history',
    STATS: '/admin/notifications/stats',
    TEMPLATES: '/admin/notifications/templates',
    RETRY_PENDING: '/admin/notifications/retry-pending',
};

// ==================== Market Prices ====================

export const MARKET_PRICE_ENDPOINTS = {
    BASE: '/market-prices',
    LATEST: '/market-prices/latest',
    BY_CROP: (cropName) => `/market-prices/crop/${cropName}`,
    TRENDS: '/market-prices/trends',
    HISTORY: '/market-prices/history',
    ANALYTICS: '/market-prices/analytics',
    TODAY: '/market-prices/today',
    CROPS: '/market-prices/crops',
    DISTRICTS: '/market-prices/districts',
    BY_DATE: (date) => `/market-prices/date/${date}`,
    OVERRIDE: '/market-prices/override',
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
    APPROVE_USER: (userId) => `/admin/users/${userId}/approve`,
    USER_STATUS: (id) => `/admin/users/${id}/status`,

    // Farmers
    FARMERS: '/admin/farmers',
    FARMER_BY_ID: (id) => `/admin/farmers/${id}`,
    VERIFY_FARMER: (id) => `/admin/farmers/${id}/verify`,
    FARMERS_EXPORT: '/admin/farmers/export',
    FARMERS_IMPORT: '/admin/farmers/import',

    // Vendors
    VENDORS_PENDING: '/admin/vendors/pending',

    // Analytics
    ANALYTICS_OVERVIEW: '/admin/analytics/overview',
    ANALYTICS_USERS: '/admin/analytics/users',
    ANALYTICS_MARKETPLACE: '/admin/analytics/marketplace',
    ANALYTICS_REVENUE: '/admin/analytics/revenue',
    ANALYTICS_DASHBOARD: '/admin/analytics/dashboard',

    // RBAC
    RBAC_ROLES: '/admin/rbac/roles',
    RBAC_PERMISSIONS: '/admin/rbac/permissions',
    RBAC_ASSIGN: '/admin/rbac/assign',

    // Health
    HEALTH_STATUS: '/admin/health/status',
    HEALTH_INTEGRATIONS: '/admin/health/integrations',
    ACTUATOR_HEALTH: '/actuator/health',
    ACTUATOR_INFO: '/actuator/info',
    ACTUATOR_METRICS: (name) => `/actuator/metrics/${name}`,

    // Settings
    SETTINGS: '/admin/system-config',
    SETTING_BY_KEY: (key) => `/admin/system-config/${key}`,
    ACTIVITIES: '/admin/activities',
};

export const ADMIN_RBAC_ENDPOINTS = {
    // Roles
    ROLES: '/admin/rbac/roles',
    ROLE_BY_ID: (id) => `/admin/rbac/roles/${id}`,
    UPDATE_ROLE_PERMISSIONS: (id) => `/admin/rbac/roles/${id}/permissions`,

    // Permissions
    PERMISSIONS: '/admin/rbac/permissions',

    // User-Role Assignment
    ASSIGN_ROLE: (userId, roleId) => `/admin/rbac/users/${userId}/roles/${roleId}`,
    REMOVE_ROLE: (userId, roleId) => `/admin/rbac/users/${userId}/roles/${roleId}`,

    // User Verification
    PENDING_USERS: '/admin/users/pending',
    VERIFIED_USERS: '/admin/users/verified',
    VERIFY_USER: (userId) => `/admin/users/${userId}/verify`,
    UNVERIFY_USER: (userId) => `/admin/users/${userId}/unverify`,
    DELETE_USER: (userId) => `/admin/users/${userId}`,
};

// ==================== Master Data ====================

export const MASTER_DATA_ENDPOINTS = {
    BY_CODE_V1: (code) => `/v1/master-data/${code}`,
    DISTRICTS: '/districts',
    CROPS: '/crops',
    UNITS: '/units',

    // Admin endpoints
    ADMIN_CROPS: '/admin/master-data/crops',
    ADMIN_DISTRICTS: '/admin/master-data/districts',
    ADMIN_CATEGORIES: '/admin/master-data/categories',
};

export const ADMIN_MASTER_DATA_ENDPOINTS = {
    CATEGORIES: '/admin/master-data/categories',
    ITEMS_BY_CATEGORY: (categoryId) => `/admin/master-data/categories/${categoryId}/items`,
    ITEMS_BY_ID: (id) => `/admin/master-data/items/${id}`,
};

// ==================== Support & Feedback ====================

export const FEEDBACK_ENDPOINTS = {
    SUBMIT: '/feedback/submit',
    BASE: '/feedback',
    ADMIN: '/admin/feedback',
    UPDATE_STATUS: (id) => `/admin/feedback/${id}/status`,
};

// ==================== Agriculture Calendar ====================

export const AGRICULTURE_CALENDAR_ENDPOINTS = {
    PUBLIC_BASE: '/agriculture-calendar',
    ADMIN_BASE: '/admin/agriculture-calendar',
    ADMIN_BY_ID: (id) => `/admin/agriculture-calendar/${id}`,
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
    ADMIN_MASTER_DATA: ADMIN_MASTER_DATA_ENDPOINTS,
    ADMIN_RBAC: ADMIN_RBAC_ENDPOINTS,
    FEEDBACK: FEEDBACK_ENDPOINTS,
    AGRICULTURE_CALENDAR: AGRICULTURE_CALENDAR_ENDPOINTS,
};
