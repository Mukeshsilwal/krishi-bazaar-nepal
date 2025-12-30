-- V4__create_crop_images_table.sql
CREATE TABLE crop_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES crop_listings(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_images_listing ON crop_images(listing_id);
CREATE INDEX idx_images_primary ON crop_images(is_primary);
