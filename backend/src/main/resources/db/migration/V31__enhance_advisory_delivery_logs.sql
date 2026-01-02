-- Weather Advisory System Enhancement
-- Migration V31: Add additional tracking columns to advisory_delivery_logs

-- Add farmer context columns
ALTER TABLE advisory_delivery_logs ADD COLUMN IF NOT EXISTS farmer_name VARCHAR(100);
ALTER TABLE advisory_delivery_logs ADD COLUMN IF NOT EXISTS farmer_phone VARCHAR(15);

-- Add weather condition columns
ALTER TABLE advisory_delivery_logs ADD COLUMN IF NOT EXISTS temperature DECIMAL(5,2);
ALTER TABLE advisory_delivery_logs ADD COLUMN IF NOT EXISTS rainfall DECIMAL(10,2);
ALTER TABLE advisory_delivery_logs ADD COLUMN IF NOT EXISTS humidity DECIMAL(5,2);

-- Add advisory context columns
ALTER TABLE advisory_delivery_logs ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20);
ALTER TABLE advisory_delivery_logs ADD COLUMN IF NOT EXISTS season VARCHAR(20);
ALTER TABLE advisory_delivery_logs ADD COLUMN IF NOT EXISTS notification_id UUID;

-- Add comments for new columns
COMMENT ON COLUMN advisory_delivery_logs.farmer_name IS 'Farmer name at time of delivery for analytics';
COMMENT ON COLUMN advisory_delivery_logs.farmer_phone IS 'Farmer phone at time of delivery';
COMMENT ON COLUMN advisory_delivery_logs.temperature IS 'Temperature (°C) when advisory was sent';
COMMENT ON COLUMN advisory_delivery_logs.rainfall IS 'Rainfall (mm) when advisory was sent';
COMMENT ON COLUMN advisory_delivery_logs.humidity IS 'Humidity (%) when advisory was sent';
COMMENT ON COLUMN advisory_delivery_logs.risk_level IS 'Risk level: LOW, MEDIUM, HIGH, CRITICAL';
COMMENT ON COLUMN advisory_delivery_logs.season IS 'Season: SPRING, MONSOON, AUTUMN, WINTER';
COMMENT ON COLUMN advisory_delivery_logs.notification_id IS 'Reference to the notification sent';
