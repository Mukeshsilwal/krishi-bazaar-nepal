-- Add verification columns to users table
ALTER TABLE users
ADD COLUMN rejection_reason VARCHAR(500),
ADD COLUMN verification_notes VARCHAR(500);
