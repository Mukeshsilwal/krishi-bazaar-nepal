-- Add profile_image_url column to users table
-- This supports profile picture uploads during registration for all user roles
-- The column stores the secure HTTPS URL from Cloudinary

ALTER TABLE users
ADD COLUMN profile_image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN users.profile_image_url IS 'Cloudinary secure URL for user profile picture';
