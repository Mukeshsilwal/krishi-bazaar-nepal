-- Add EXPERT role to users table role check constraint
-- This migration updates the role constraint to include the new EXPERT role

-- Drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add the updated constraint with EXPERT role
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('FARMER', 'BUYER', 'VENDOR', 'ADMIN', 'EXPERT', 'SUPER_ADMIN'));
