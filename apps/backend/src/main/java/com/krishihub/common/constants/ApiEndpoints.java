package com.krishihub.common.constants;

/**
 * Centralized API endpoint constants for the KrishiHub application.
 * This class provides a single source of truth for all API endpoints,
 * making it easier to maintain consistency and prevent typos.
 * 
 * Organized by functional modules for easy navigation.
 */
public final class ApiEndpoints {

    private ApiEndpoints() {
        // Prevent instantiation
    }

    // ==================== Authentication & Authorization ====================

    public static final String AUTH_BASE = "/api/auth";
    public static final String AUTH_REGISTER = AUTH_BASE + "/register";
    public static final String AUTH_LOGIN = AUTH_BASE + "/login";
    public static final String AUTH_ADMIN_LOGIN = AUTH_BASE + "/admin/login";
    public static final String AUTH_ADMIN_REGISTER = AUTH_BASE + "/admin/register";
    public static final String AUTH_VERIFY_OTP = AUTH_BASE + "/verify-otp";
    public static final String AUTH_ME = AUTH_BASE + "/me";
    public static final String AUTH_FORGOT_PASSWORD = AUTH_BASE + "/forgot-password";
    public static final String AUTH_RESET_PASSWORD = AUTH_BASE + "/reset-password";

    // ==================== Marketplace & Listings ====================

    public static final String LISTINGS_BASE = "/api/listings";
    public static final String LISTINGS_CREATE = LISTINGS_BASE;
    public static final String LISTINGS_GET_ALL = LISTINGS_BASE;
    public static final String LISTINGS_GET_BY_ID = LISTINGS_BASE + "/{id}";
    public static final String LISTINGS_MY = LISTINGS_BASE + "/my";
    public static final String LISTINGS_UPDATE = LISTINGS_BASE + "/{id}";
    public static final String LISTINGS_DELETE = LISTINGS_BASE + "/{id}";
    public static final String LISTINGS_UPLOAD_IMAGE = LISTINGS_BASE + "/{id}/images";
    public static final String LISTINGS_CROPS = LISTINGS_BASE + "/crops";

    // ==================== Orders & Payments ====================

    public static final String ORDERS_BASE = "/api/orders";
    public static final String ORDERS_CREATE = ORDERS_BASE;
    public static final String ORDERS_GET_ALL = ORDERS_BASE;
    public static final String ORDERS_GET_BY_ID = ORDERS_BASE + "/{id}";
    public static final String ORDERS_MY_PURCHASES = ORDERS_BASE + "/my/purchases";
    public static final String ORDERS_MY_SALES = ORDERS_BASE + "/my/sales";
    public static final String ORDERS_UPDATE_STATUS = ORDERS_BASE + "/{id}/status";
    public static final String ORDERS_CANCEL = ORDERS_BASE + "/{id}/cancel";

    public static final String PAYMENTS_BASE = "/api/payments";
    public static final String PAYMENTS_INITIATE = PAYMENTS_BASE + "/initiate";
    public static final String PAYMENTS_VERIFY = PAYMENTS_BASE + "/verify";
    public static final String PAYMENTS_ESEWA_SUCCESS = PAYMENTS_BASE + "/esewa/success";
    public static final String PAYMENTS_ESEWA_FAILURE = PAYMENTS_BASE + "/esewa/failure";

    // ==================== Knowledge & Content Management ====================

    public static final String KNOWLEDGE_BASE = "/api/knowledge";
    public static final String KNOWLEDGE_GET_ALL = KNOWLEDGE_BASE;
    public static final String KNOWLEDGE_GET_BY_ID = KNOWLEDGE_BASE + "/{id}";
    public static final String KNOWLEDGE_SEARCH = KNOWLEDGE_BASE + "/search";
    public static final String KNOWLEDGE_BY_CATEGORY = KNOWLEDGE_BASE + "/category/{category}";
    public static final String KNOWLEDGE_CATEGORIES = KNOWLEDGE_BASE + "/categories";

    public static final String KNOWLEDGE_MODERATION_BASE = "/api/knowledge/moderation";
    public static final String KNOWLEDGE_MODERATION_QUEUE = KNOWLEDGE_MODERATION_BASE + "/queue";
    public static final String KNOWLEDGE_MODERATION_APPROVE = KNOWLEDGE_MODERATION_BASE + "/{id}/approve";
    public static final String KNOWLEDGE_MODERATION_REJECT = KNOWLEDGE_MODERATION_BASE + "/{id}/reject";

    public static final String KNOWLEDGE_SOURCES_BASE = "/api/knowledge/sources";
    public static final String KNOWLEDGE_SOURCES_GET_ALL = KNOWLEDGE_SOURCES_BASE;
    public static final String KNOWLEDGE_SOURCES_CREATE = KNOWLEDGE_SOURCES_BASE;
    public static final String KNOWLEDGE_SOURCES_UPDATE = KNOWLEDGE_SOURCES_BASE + "/{id}";
    public static final String KNOWLEDGE_SOURCES_DELETE = KNOWLEDGE_SOURCES_BASE + "/{id}";

    public static final String CMS_BASE = "/api/admin/cms";
    public static final String CMS_CONTENT = CMS_BASE + "/content";
    public static final String CMS_CONTENT_BY_ID = CMS_BASE + "/content/{id}";

    public static final String CONTENT_BASE = "/api/admin/content";
    public static final String CONTENT_GET_ALL = CONTENT_BASE;
    public static final String CONTENT_GET_BY_ID = CONTENT_BASE + "/{id}";
    public static final String CONTENT_CREATE = CONTENT_BASE;
    public static final String CONTENT_UPDATE = CONTENT_BASE + "/{id}";
    public static final String CONTENT_DELETE = CONTENT_BASE + "/{id}";
    public static final String CONTENT_PUBLISH = CONTENT_BASE + "/{id}/publish";

    // ==================== Advisory & Weather ====================

    public static final String ADVISORY_BASE = "/api/advisory";
    public static final String ADVISORY_GET_ALL = ADVISORY_BASE;
    public static final String ADVISORY_GET_BY_ID = ADVISORY_BASE + "/{id}";
    public static final String ADVISORY_MY = ADVISORY_BASE + "/my";

    public static final String WEATHER_BASE = "/api/weather";
    public static final String WEATHER_CURRENT = WEATHER_BASE + "/current";
    public static final String WEATHER_FORECAST = WEATHER_BASE + "/forecast";
    public static final String WEATHER_BY_LOCATION = WEATHER_BASE + "/location";

    public static final String WEATHER_ADVISORY_BASE = "/api/weather-advisories";
    public static final String WEATHER_ADVISORY_GET_ALL = WEATHER_ADVISORY_BASE;
    public static final String WEATHER_ADVISORY_GET_BY_ID = WEATHER_ADVISORY_BASE + "/{id}";
    public static final String WEATHER_ADVISORY_MY = WEATHER_ADVISORY_BASE + "/my";

    public static final String ADVISORY_LOGS_BASE = "/api/advisory-logs";
    public static final String ADVISORY_LOGS_GET_ALL = ADVISORY_LOGS_BASE;
    public static final String ADVISORY_LOGS_GET_BY_ID = ADVISORY_LOGS_BASE + "/{id}";
    public static final String ADVISORY_LOGS_BY_FARMER = ADVISORY_LOGS_BASE + "/farmer/{farmerId}";
    public static final String ADVISORY_LOGS_STATS = ADVISORY_LOGS_BASE + "/stats";

    public static final String RULES_BASE = "/api/admin/rules";
    public static final String RULES_GET_ALL = RULES_BASE;
    public static final String RULES_GET_BY_ID = RULES_BASE + "/{id}";
    public static final String RULES_CREATE = RULES_BASE;
    public static final String RULES_UPDATE = RULES_BASE + "/{id}";
    public static final String RULES_DELETE = RULES_BASE + "/{id}";
    public static final String RULES_SIMULATE = RULES_BASE + "/simulate";

    // ==================== AI & Diagnosis ====================

    public static final String AI_BASE = "/api/ai";
    public static final String AI_CHAT = AI_BASE + "/chat";
    public static final String AI_DIAGNOSE = AI_BASE + "/diagnose";

    public static final String DIAGNOSIS_BASE = "/api/diagnoses";
    public static final String DIAGNOSIS_CREATE = DIAGNOSIS_BASE;
    public static final String DIAGNOSIS_GET_ALL = DIAGNOSIS_BASE;
    public static final String DIAGNOSIS_GET_BY_ID = DIAGNOSIS_BASE + "/{id}";
    public static final String DIAGNOSIS_MY = DIAGNOSIS_BASE + "/my";
    public static final String DIAGNOSIS_FEEDBACK = DIAGNOSIS_BASE + "/{id}/feedback";

    public static final String ADMIN_DIAGNOSIS_BASE = "/api/admin/diagnosis";
    public static final String ADMIN_DIAGNOSIS_PENDING = ADMIN_DIAGNOSIS_BASE + "/pending";
    public static final String ADMIN_DIAGNOSIS_REVIEW = ADMIN_DIAGNOSIS_BASE + "/{id}/review";
    public static final String ADMIN_DIAGNOSIS_STATS = ADMIN_DIAGNOSIS_BASE + "/stats";

    public static final String DISEASES_BASE = "/api/diseases";
    public static final String DISEASES_GET_ALL = DISEASES_BASE;
    public static final String DISEASES_GET_BY_ID = DISEASES_BASE + "/{id}";
    public static final String DISEASES_SEARCH = DISEASES_BASE + "/search";
    public static final String DISEASES_BY_CROP = DISEASES_BASE + "/crop/{cropName}";

    public static final String DISEASE_SIGNALS_BASE = "/api/disease/signals";
    public static final String DISEASE_SIGNALS_REPORT = DISEASE_SIGNALS_BASE + "/report";
    public static final String DISEASE_SIGNALS_GET_ALL = DISEASE_SIGNALS_BASE;

    // ==================== Finance & Subsidies ====================

    public static final String FINANCE_BASE = "/api/finance";
    public static final String FINANCE_LOANS = FINANCE_BASE + "/loans";
    public static final String FINANCE_LOAN_BY_ID = FINANCE_BASE + "/loans/{id}";
    public static final String FINANCE_APPLY_LOAN = FINANCE_BASE + "/loans/apply";

    public static final String SUBSIDIES_BASE = "/api/subsidies";
    public static final String SUBSIDIES_GET_ALL = SUBSIDIES_BASE;
    public static final String SUBSIDIES_GET_BY_ID = SUBSIDIES_BASE + "/{id}";
    public static final String SUBSIDIES_ELIGIBLE = SUBSIDIES_BASE + "/eligible";

    public static final String SCHEMES_BASE = "/api/schemes";
    public static final String SCHEMES_GET_ALL = SCHEMES_BASE;
    public static final String SCHEMES_GET_BY_ID = SCHEMES_BASE + "/{id}";
    public static final String SCHEMES_ACTIVE = SCHEMES_BASE + "/active";

    // ==================== Logistics & Cold Storage ====================

    public static final String LOGISTICS_BASE = "/api/logistics";
    public static final String LOGISTICS_PROVIDERS = LOGISTICS_BASE + "/providers";
    public static final String LOGISTICS_QUOTE = LOGISTICS_BASE + "/quote";
    public static final String LOGISTICS_BOOK = LOGISTICS_BASE + "/book";
    public static final String LOGISTICS_TRACK = LOGISTICS_BASE + "/track/{id}";

    public static final String COLD_STORAGE_BASE = "/api/cold-storage";
    public static final String COLD_STORAGE_GET_ALL = COLD_STORAGE_BASE;
    public static final String COLD_STORAGE_GET_BY_ID = COLD_STORAGE_BASE + "/{id}";
    public static final String COLD_STORAGE_NEARBY = COLD_STORAGE_BASE + "/nearby";
    public static final String COLD_STORAGE_BOOK = COLD_STORAGE_BASE + "/book";

    // ==================== Messaging & Notifications ====================

    public static final String MESSAGES_BASE = "/api/messages";
    public static final String MESSAGES_SEND = MESSAGES_BASE;
    public static final String MESSAGES_CONVERSATIONS = MESSAGES_BASE + "/conversations";
    public static final String MESSAGES_CONVERSATION = MESSAGES_BASE + "/{userId}";
    public static final String MESSAGES_UNREAD_COUNT = MESSAGES_BASE + "/unread/count";
    public static final String MESSAGES_PRESENCE = MESSAGES_BASE + "/presence";
    public static final String MESSAGES_MARK_READ = MESSAGES_BASE + "/{userId}/read";

    public static final String NOTIFICATIONS_BASE = "/api/notifications";
    public static final String NOTIFICATIONS_GET_ALL = NOTIFICATIONS_BASE;
    public static final String NOTIFICATIONS_MARK_READ = NOTIFICATIONS_BASE + "/{id}/read";
    public static final String NOTIFICATIONS_MARK_ALL_READ = NOTIFICATIONS_BASE + "/read-all";
    public static final String NOTIFICATIONS_UNREAD_COUNT = NOTIFICATIONS_BASE + "/unread/count";

    public static final String ADMIN_NOTIFICATIONS_BASE = "/api/admin/notifications";
    public static final String ADMIN_NOTIFICATIONS_SEND = ADMIN_NOTIFICATIONS_BASE + "/send";
    public static final String ADMIN_NOTIFICATIONS_BROADCAST = ADMIN_NOTIFICATIONS_BASE + "/broadcast";
    public static final String ADMIN_NOTIFICATIONS_HISTORY = ADMIN_NOTIFICATIONS_BASE + "/history";

    // ==================== Market Prices ====================

    public static final String MARKET_PRICES_BASE = "/api/market-prices";
    public static final String MARKET_PRICES_GET_ALL = MARKET_PRICES_BASE;
    public static final String MARKET_PRICES_LATEST = MARKET_PRICES_BASE + "/latest";
    public static final String MARKET_PRICES_BY_CROP = MARKET_PRICES_BASE + "/crop/{cropName}";
    public static final String MARKET_PRICES_TRENDS = MARKET_PRICES_BASE + "/trends";

    public static final String MARKETS_BASE = "/api/markets";
    public static final String MARKETS_GET_ALL = MARKETS_BASE;
    public static final String MARKETS_GET_BY_ID = MARKETS_BASE + "/{id}";

    public static final String PRICE_ALERTS_BASE = "/api/price-alerts";
    public static final String PRICE_ALERTS_CREATE = PRICE_ALERTS_BASE;
    public static final String PRICE_ALERTS_GET_ALL = PRICE_ALERTS_BASE;
    public static final String PRICE_ALERTS_DELETE = PRICE_ALERTS_BASE + "/{id}";

    // ==================== Admin & Analytics ====================

    public static final String ADMIN_BASE = "/api/admin";
    public static final String ADMIN_DASHBOARD = ADMIN_BASE + "/dashboard";
    public static final String ADMIN_STATS = ADMIN_BASE + "/stats";

    public static final String ADMIN_USERS_BASE = "/api/admin/users";
    public static final String ADMIN_USERS_GET_ALL = ADMIN_USERS_BASE;
    public static final String ADMIN_USERS_GET_BY_ID = ADMIN_USERS_BASE + "/{id}";
    public static final String ADMIN_USERS_UPDATE = ADMIN_USERS_BASE + "/{id}";
    public static final String ADMIN_USERS_DELETE = ADMIN_USERS_BASE + "/{id}";

    public static final String ADMIN_FARMERS_BASE = "/api/admin/farmers";
    public static final String ADMIN_FARMERS_GET_ALL = ADMIN_FARMERS_BASE;
    public static final String ADMIN_FARMERS_GET_BY_ID = ADMIN_FARMERS_BASE + "/{id}";
    public static final String ADMIN_FARMERS_VERIFY = ADMIN_FARMERS_BASE + "/{id}/verify";

    public static final String ADMIN_ANALYTICS_BASE = "/api/admin/analytics";
    public static final String ADMIN_ANALYTICS_OVERVIEW = ADMIN_ANALYTICS_BASE + "/overview";
    public static final String ADMIN_ANALYTICS_USERS = ADMIN_ANALYTICS_BASE + "/users";
    public static final String ADMIN_ANALYTICS_MARKETPLACE = ADMIN_ANALYTICS_BASE + "/marketplace";
    public static final String ADMIN_ANALYTICS_REVENUE = ADMIN_ANALYTICS_BASE + "/revenue";

    public static final String ADMIN_RBAC_BASE = "/api/admin/rbac";
    public static final String ADMIN_RBAC_ROLES = ADMIN_RBAC_BASE + "/roles";
    public static final String ADMIN_RBAC_PERMISSIONS = ADMIN_RBAC_BASE + "/permissions";
    public static final String ADMIN_RBAC_ASSIGN = ADMIN_RBAC_BASE + "/assign";

    public static final String ADMIN_HEALTH_BASE = "/api/admin/health";
    public static final String ADMIN_HEALTH_STATUS = ADMIN_HEALTH_BASE + "/status";
    public static final String ADMIN_HEALTH_INTEGRATIONS = ADMIN_HEALTH_BASE + "/integrations";

    public static final String ADMIN_SETTINGS_BASE = "/api/admin/settings";
    public static final String ADMIN_SETTINGS_GET_ALL = ADMIN_SETTINGS_BASE;
    public static final String ADMIN_SETTINGS_UPDATE = ADMIN_SETTINGS_BASE + "/{key}";

    // ==================== Master Data ====================

    public static final String MASTER_DATA_BASE = "/api";
    public static final String MASTER_DATA_DISTRICTS = MASTER_DATA_BASE + "/districts";
    public static final String MASTER_DATA_CROPS = MASTER_DATA_BASE + "/crops";
    public static final String MASTER_DATA_UNITS = MASTER_DATA_BASE + "/units";

    public static final String ADMIN_MASTER_DATA_BASE = "/api/admin/master-data";
    public static final String ADMIN_MASTER_DATA_CROPS = ADMIN_MASTER_DATA_BASE + "/crops";
    public static final String ADMIN_MASTER_DATA_DISTRICTS = ADMIN_MASTER_DATA_BASE + "/districts";

    // ==================== Support & Feedback ====================

    public static final String FEEDBACK_BASE = "/api/feedback";
    public static final String FEEDBACK_SUBMIT = FEEDBACK_BASE + "/submit";
    public static final String FEEDBACK_GET_ALL = FEEDBACK_BASE;
}
