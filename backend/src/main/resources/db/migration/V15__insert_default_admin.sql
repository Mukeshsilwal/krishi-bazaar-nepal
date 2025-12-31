-- V15__insert_default_admin.sql

-- Insert default admin user if not exists
INSERT INTO users (
    id,
    mobile_number,
    role,
    name,
    email,
    district,
    ward,
    verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '+9779841000000',
    'ADMIN',
    'System Admin',
    'admin@krishibazaar.com',
    'Kathmandu',
    '1',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (mobile_number) DO NOTHING;
