-- V36__update_logistics_schema.sql

-- Update Cold Storage
ALTER TABLE cold_storage
ADD COLUMN temperature_range VARCHAR(50),
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Migrate Logistics Order to Shipment (Rename and Alter)
ALTER TABLE logistics_orders RENAME TO shipments;

-- Update columns for Shipments
ALTER TABLE shipments
ADD COLUMN source_location VARCHAR(255), -- Nullable initially if data exists, but we'll try to set default or handle it
ADD COLUMN destination_location VARCHAR(255),
ADD COLUMN tracking_code VARCHAR(50) UNIQUE,
ADD COLUMN carrier_name VARCHAR(100),
ADD COLUMN estimated_delivery TIMESTAMP,
ADD COLUMN last_updated TIMESTAMP;

-- Rename vehicle_type if needed or keep. It exists in LogisticsOrder. 
-- LogisticsOrder allowed null driver_name, etc. Shipment requires source/dest.
-- For existing records, we might need to update them or leave null. 
-- Since it's dev, we can set nullable for now or default.

-- Create indexes
CREATE INDEX idx_shipments_tracking_code ON shipments(tracking_code);
CREATE INDEX idx_shipments_order_id ON shipments(order_id);
-- idx_logistics_order_status renamed automatically or need to check? 
-- Postgres renames index typically if valid, but let's ensure.
DROP INDEX IF EXISTS idx_logistics_order_status;
CREATE INDEX idx_shipments_status ON shipments(status);
