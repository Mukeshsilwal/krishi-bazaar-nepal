-- =====================================================
-- RBAC Permission and Role Seeding Migration
-- This migration seeds the permission-based authorization system
-- =====================================================

-- =====================================================
-- STEP 1: Insert Permissions (MODULE:ACTION format)
-- =====================================================

-- USER Module Permissions
INSERT INTO permissions (id, name, module, description) VALUES
(gen_random_uuid(), 'USER:READ', 'USER', 'View user information'),
(gen_random_uuid(), 'USER:CREATE', 'USER', 'Create new users'),
(gen_random_uuid(), 'USER:UPDATE', 'USER', 'Update user information'),
(gen_random_uuid(), 'USER:DELETE', 'USER', 'Delete users'),
(gen_random_uuid(), 'USER:VERIFY', 'USER', 'Verify and approve users');

-- ORDER Module Permissions
INSERT INTO permissions (id, name, module, description) VALUES
(gen_random_uuid(), 'ORDER:READ', 'ORDER', 'View orders'),
(gen_random_uuid(), 'ORDER:CREATE', 'ORDER', 'Create new orders'),
(gen_random_uuid(), 'ORDER:UPDATE', 'ORDER', 'Update order status'),
(gen_random_uuid(), 'ORDER:DELETE', 'ORDER', 'Cancel orders'),
(gen_random_uuid(), 'ORDER:MANAGE_ALL', 'ORDER', 'Manage all orders (admin)');

-- PAYMENT Module Permissions
INSERT INTO permissions (id, name, module, description) VALUES
(gen_random_uuid(), 'PAYMENT:INITIATE', 'PAYMENT', 'Initiate payment transactions'),
(gen_random_uuid(), 'PAYMENT:VERIFY', 'PAYMENT', 'Verify payment status'),
(gen_random_uuid(), 'PAYMENT:READ', 'PAYMENT', 'View payment transactions'),
(gen_random_uuid(), 'PAYMENT:MANAGE', 'PAYMENT', 'Manage all payments (admin)');

-- MARKETPLACE Module Permissions
INSERT INTO permissions (id, name, module, description) VALUES
(gen_random_uuid(), 'MARKETPLACE:READ', 'MARKETPLACE', 'View marketplace listings'),
(gen_random_uuid(), 'MARKETPLACE:CREATE', 'MARKETPLACE', 'Create marketplace listings'),
(gen_random_uuid(), 'MARKETPLACE:UPDATE', 'MARKETPLACE', 'Update own listings'),
(gen_random_uuid(), 'MARKETPLACE:DELETE', 'MARKETPLACE', 'Delete own listings'),
(gen_random_uuid(), 'MARKETPLACE:MANAGE_ALL', 'MARKETPLACE', 'Manage all listings (admin)');

-- ADMIN Module Permissions
INSERT INTO permissions (id, name, module, description) VALUES
(gen_random_uuid(), 'ADMIN:PANEL', 'ADMIN', 'Access admin panel'),
(gen_random_uuid(), 'ADMIN:ANALYTICS', 'ADMIN', 'View analytics and reports'),
(gen_random_uuid(), 'ADMIN:SETTINGS', 'ADMIN', 'Manage system settings'),
(gen_random_uuid(), 'ADMIN:USERS', 'ADMIN', 'Manage users'),
(gen_random_uuid(), 'ADMIN:ROLES', 'ADMIN', 'Manage roles and permissions');

-- LOGISTICS Module Permissions
INSERT INTO permissions (id, name, module, description) VALUES
(gen_random_uuid(), 'LOGISTICS:READ', 'LOGISTICS', 'View logistics information'),
(gen_random_uuid(), 'LOGISTICS:CREATE', 'LOGISTICS', 'Create shipment bookings'),
(gen_random_uuid(), 'LOGISTICS:UPDATE', 'LOGISTICS', 'Update shipment status'),
(gen_random_uuid(), 'LOGISTICS:MANAGE', 'LOGISTICS', 'Manage all logistics (admin)');

-- CONTENT Module Permissions
INSERT INTO permissions (id, name, module, description) VALUES
(gen_random_uuid(), 'CONTENT:READ', 'CONTENT', 'View content'),
(gen_random_uuid(), 'CONTENT:CREATE', 'CONTENT', 'Create content'),
(gen_random_uuid(), 'CONTENT:UPDATE', 'CONTENT', 'Update content'),
(gen_random_uuid(), 'CONTENT:DELETE', 'CONTENT', 'Delete content'),
(gen_random_uuid(), 'CONTENT:PUBLISH', 'CONTENT', 'Publish content');

-- WEATHER Module Permissions
INSERT INTO permissions (id, name, module, description) VALUES
(gen_random_uuid(), 'WEATHER:READ', 'WEATHER', 'View weather information'),
(gen_random_uuid(), 'WEATHER:MANAGE', 'WEATHER', 'Manage weather data sources');

-- KNOWLEDGE Module Permissions
INSERT INTO permissions (id, name, module, description) VALUES
(gen_random_uuid(), 'KNOWLEDGE:READ', 'KNOWLEDGE', 'View knowledge base'),
(gen_random_uuid(), 'KNOWLEDGE:CREATE', 'KNOWLEDGE', 'Create knowledge articles'),
(gen_random_uuid(), 'KNOWLEDGE:MODERATE', 'KNOWLEDGE', 'Moderate knowledge content');

-- DIAGNOSIS Module Permissions
INSERT INTO permissions (id, name, module, description) VALUES
(gen_random_uuid(), 'DIAGNOSIS:READ', 'DIAGNOSIS', 'View diagnosis results'),
(gen_random_uuid(), 'DIAGNOSIS:CREATE', 'DIAGNOSIS', 'Submit diagnosis requests'),
(gen_random_uuid(), 'DIAGNOSIS:REVIEW', 'DIAGNOSIS', 'Review and validate diagnoses');

-- FINANCE Module Permissions
INSERT INTO permissions (id, name, module, description) VALUES
(gen_random_uuid(), 'FINANCE:READ', 'FINANCE', 'View financial schemes'),
(gen_random_uuid(), 'FINANCE:MANAGE', 'FINANCE', 'Manage financial schemes');

-- NOTIFICATION Module Permissions
INSERT INTO permissions (id, name, module, description) VALUES
(gen_random_uuid(), 'NOTIFICATION:READ', 'NOTIFICATION', 'View notifications'),
(gen_random_uuid(), 'NOTIFICATION:SEND', 'NOTIFICATION', 'Send notifications');

-- MASTERDATA Module Permissions
INSERT INTO permissions (id, name, module, description) VALUES
(gen_random_uuid(), 'MASTERDATA:READ', 'MASTERDATA', 'View master data'),
(gen_random_uuid(), 'MASTERDATA:MANAGE', 'MASTERDATA', 'Manage master data');

-- CALENDAR Module Permissions
INSERT INTO permissions (id, name, module, description) VALUES
(gen_random_uuid(), 'CALENDAR:READ', 'CALENDAR', 'View agriculture calendar'),
(gen_random_uuid(), 'CALENDAR:MANAGE', 'CALENDAR', 'Manage calendar entries');

-- AGRISTORE Module Permissions
INSERT INTO permissions (id, name, module, description) VALUES
(gen_random_uuid(), 'AGRISTORE:READ', 'AGRISTORE', 'View agri products'),
(gen_random_uuid(), 'AGRISTORE:MANAGE', 'AGRISTORE', 'Manage agri products');

-- VEHICLE Module Permissions
INSERT INTO permissions (id, name, module, description) VALUES
(gen_random_uuid(), 'VEHICLE:READ', 'VEHICLE', 'View vehicle bookings'),
(gen_random_uuid(), 'VEHICLE:CREATE', 'VEHICLE', 'Create vehicle bookings'),
(gen_random_uuid(), 'VEHICLE:MANAGE', 'VEHICLE', 'Manage vehicle bookings');

-- =====================================================
-- STEP 2: Create Default Roles
-- =====================================================

-- Create ADMIN role
INSERT INTO roles (id, name, description, is_system_defined) VALUES
(gen_random_uuid(), 'SUPER_ADMIN', 'System administrator with full access', true);

-- Create FARMER role
INSERT INTO roles (id, name, description, is_system_defined) VALUES
(gen_random_uuid(), 'FARMER_ROLE', 'Farmer with marketplace and order capabilities', true);

-- Create BUYER role
INSERT INTO roles (id, name, description, is_system_defined) VALUES
(gen_random_uuid(), 'BUYER_ROLE', 'Buyer with order and payment capabilities', true);

-- Create VENDOR role
INSERT INTO roles (id, name, description, is_system_defined) VALUES
(gen_random_uuid(), 'VENDOR_ROLE', 'Vendor with marketplace capabilities', true);

-- Create EXPERT role
INSERT INTO roles (id, name, description, is_system_defined) VALUES
(gen_random_uuid(), 'EXPERT_ROLE', 'Agricultural expert with diagnosis and knowledge capabilities', true);

-- =====================================================
-- STEP 3: Assign Permissions to Roles
-- =====================================================

-- SUPER_ADMIN gets ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'SUPER_ADMIN';

-- FARMER_ROLE permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'FARMER_ROLE'
AND p.name IN (
    'MARKETPLACE:READ', 'MARKETPLACE:CREATE', 'MARKETPLACE:UPDATE', 'MARKETPLACE:DELETE',
    'ORDER:READ', 'ORDER:CREATE', 'ORDER:UPDATE',
    'PAYMENT:INITIATE', 'PAYMENT:READ',
    'LOGISTICS:READ', 'LOGISTICS:CREATE',
    'KNOWLEDGE:READ',
    'WEATHER:READ',
    'DIAGNOSIS:READ', 'DIAGNOSIS:CREATE',
    'FINANCE:READ',
    'NOTIFICATION:READ',
    'CALENDAR:READ',
    'AGRISTORE:READ',
    'VEHICLE:READ', 'VEHICLE:CREATE'
);

-- BUYER_ROLE permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'BUYER_ROLE'
AND p.name IN (
    'MARKETPLACE:READ',
    'ORDER:READ', 'ORDER:CREATE', 'ORDER:DELETE',
    'PAYMENT:INITIATE', 'PAYMENT:READ',
    'KNOWLEDGE:READ',
    'WEATHER:READ',
    'NOTIFICATION:READ',
    'CALENDAR:READ',
    'AGRISTORE:READ',
    'VEHICLE:READ', 'VEHICLE:CREATE'
);

-- VENDOR_ROLE permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'VENDOR_ROLE'
AND p.name IN (
    'MARKETPLACE:READ', 'MARKETPLACE:CREATE', 'MARKETPLACE:UPDATE', 'MARKETPLACE:DELETE',
    'ORDER:READ',
    'LOGISTICS:READ',
    'KNOWLEDGE:READ',
    'NOTIFICATION:READ',
    'AGRISTORE:READ', 'AGRISTORE:MANAGE'
);

-- EXPERT_ROLE permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'EXPERT_ROLE'
AND p.name IN (
    'DIAGNOSIS:READ', 'DIAGNOSIS:CREATE', 'DIAGNOSIS:REVIEW',
    'KNOWLEDGE:READ', 'KNOWLEDGE:CREATE', 'KNOWLEDGE:MODERATE',
    'CONTENT:READ', 'CONTENT:CREATE', 'CONTENT:UPDATE',
    'WEATHER:READ',
    'NOTIFICATION:READ',
    'CALENDAR:READ'
);

-- =====================================================
-- STEP 4: Assign Roles to Existing Users
-- Map User.role enum to RBAC roles
-- =====================================================

-- Assign SUPER_ADMIN role to users with ADMIN enum
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.role = 'ADMIN'
AND r.name = 'SUPER_ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Assign FARMER_ROLE to users with FARMER enum
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.role = 'FARMER'
AND r.name = 'FARMER_ROLE'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Assign BUYER_ROLE to users with BUYER enum
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.role = 'BUYER'
AND r.name = 'BUYER_ROLE'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Assign VENDOR_ROLE to users with VENDOR enum
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.role = 'VENDOR'
AND r.name = 'VENDOR_ROLE'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Assign EXPERT_ROLE to users with EXPERT enum
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.role = 'EXPERT'
AND r.name = 'EXPERT_ROLE'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);
