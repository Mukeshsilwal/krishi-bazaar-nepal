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
    public static final String NOTIFICATION_ALERT_MANAGE = "NOTIFICATION:ALERT:MANAGE";
    public static final String NOTIFICATION_TEMPLATE_MANAGE = "NOTIFICATION:TEMPLATE:MANAGE";

    // CMS
    public static final String CMS_MANAGE = "CMS:MANAGE";
    public static final String CONTENT_MANAGE = "CONTENT:MANAGE";

    // Marketplace
    public static final String MARKETPLACE_PRODUCT_MANAGE = "MARKETPLACE:PRODUCT:MANAGE";
    
    // Admin Panel
    public static final String ADMIN_PANEL = "ADMIN:PANEL";

    // Master Data
    public static final String MASTER_DATA_MANAGE = "MASTER_DATA:MANAGE";

    private PermissionConstants() {}
}
