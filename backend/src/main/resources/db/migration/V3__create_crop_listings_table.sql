-- V3__create_crop_listings_table.sql
CREATE TABLE crop_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    harvest_date DATE,
    description TEXT,
    location VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SOLD', 'EXPIRED', 'DELETED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listings_farmer ON crop_listings(farmer_id);
CREATE INDEX idx_listings_status ON crop_listings(status);
CREATE INDEX idx_listings_crop_name ON crop_listings(crop_name);
CREATE INDEX idx_listings_created ON crop_listings(created_at DESC);
