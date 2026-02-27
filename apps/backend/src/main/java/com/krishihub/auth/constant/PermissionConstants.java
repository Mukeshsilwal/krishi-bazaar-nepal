package com.krishihub.auth.constant;

public class PermissionConstants {

    // RBAC
    public static final String RBAC_ROLE_READ = "RBAC:ROLE:READ";
    public static final String RBAC_ROLE_WRITE = "RBAC:ROLE:WRITE";
    public static final String RBAC_ROLE_DELETE = "RBAC:ROLE:DELETE";
    public static final String RBAC_PERMISSION_READ = "RBAC:PERMISSION:READ";

    // User Management
    public static final String USER_MANAGEMENT_READ = "USER:MANAGEMENT:READ";
    public static final String USER_MANAGEMENT_WRITE = "USER:MANAGEMENT:WRITE";
    public static final String USER_MANAGEMENT_DELETE = "USER:MANAGEMENT:DELETE";
    public static final String USER_MANAGEMENT_VERIFY = "USER:MANAGEMENT:VERIFY";

    // Content
    public static final String CONTENT_ARTICLE_READ = "CONTENT:ARTICLE:READ";
    public static final String CONTENT_ARTICLE_PUBLISH = "CONTENT:ARTICLE:PUBLISH";
    public static final String CONTENT_ARTICLE_WRITE = "CONTENT:ARTICLE:WRITE";

    // Notifications
    public static final String NOTIFICATION_MANAGE = "NOTIFICATION:MANAGE";
    public static final String NOTIFICATION_ALERT_MANAGE = "NOTIFICATION:ALERT:MANAGE";
    public static final String NOTIFICATION_TEMPLATE_MANAGE = "NOTIFICATION:TEMPLATE:MANAGE";

    // CMS
    public static final String CMS_MANAGE = "CMS:MANAGE";
    public static final String CONTENT_MANAGE = "CONTENT:MANAGE";

    // Marketplace
    public static final String MARKETPLACE_PRODUCT_MANAGE = "MARKETPLACE:PRODUCT:MANAGE";
    
    // Admin Panel & Analytics
    public static final String ADMIN_PANEL = "ADMIN:PANEL";
    public static final String ADMIN_READ = "ADMIN:READ";
    public static final String ADMIN_WRITE = "ADMIN:WRITE";
    public static final String ADMIN_USERS = "ADMIN:USERS";
    public static final String ADMIN_ROLES = "ADMIN:ROLES";
    public static final String ADMIN_SETTINGS = "ADMIN:SETTINGS";
    public static final String ADMIN_ANALYTICS = "ADMIN:ANALYTICS";

    // Master Data
    public static final String MASTER_DATA_MANAGE = "MASTER_DATA:MANAGE";
    public static final String MASTER_DATA_READ = "MASTER_DATA:READ";
    public static final String MASTERDATA_MANAGE = "MASTERDATA:MANAGE"; // Legacy/Alias support

    // Logistics
    public static final String LOGISTICS_MANAGE = "LOGISTICS:MANAGE";
    public static final String LOGISTICS_READ = "LOGISTICS:READ";
    
    // Vehicle & Shipment
    public static final String VEHICLE_READ = "VEHICLE:READ";
    public static final String VEHICLE_CREATE = "VEHICLE:CREATE";
    
    // Payments
    public static final String PAYMENT_READ = "PAYMENT:READ";
    public static final String PAYMENT_INITIATE = "PAYMENT:INITIATE";
    public static final String PAYMENT_VERIFY = "PAYMENT:VERIFY";
    
    // Orders
    public static final String ORDER_READ = "ORDER:READ";
    public static final String ORDER_CREATE = "ORDER:CREATE";
    public static final String ORDER_UPDATE = "ORDER:UPDATE";
    public static final String ORDER_DELETE = "ORDER:DELETE";

    // Marketplace
    public static final String MARKETPLACE_READ = "MARKETPLACE:READ";
    public static final String MARKETPLACE_CREATE = "MARKETPLACE:CREATE";
    public static final String MARKETPLACE_UPDATE = "MARKETPLACE:UPDATE";
    public static final String MARKETPLACE_DELETE = "MARKETPLACE:DELETE";

    // Knowledge & CMS
    public static final String KNOWLEDGE_MANAGE = "KNOWLEDGE:MANAGE";
    public static final String CALENDAR_MANAGE = "CALENDAR:MANAGE";
    public static final String FINANCE_MANAGE = "FINANCE:MANAGE";
    public static final String AGRISTORE_MANAGE = "AGRISTORE:MANAGE";
    public static final String DIAGNOSIS_CREATE = "DIAGNOSIS:CREATE";

    // User Fallbacks
    public static final String USER_READ = "USER:READ";
    public static final String USER_VERIFY = "USER:VERIFY";

    private PermissionConstants() {}
}
