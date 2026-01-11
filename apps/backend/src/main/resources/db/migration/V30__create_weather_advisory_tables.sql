-- Weather Advisory System Tables
-- Migration V30: Create weather advisory tables

-- Add rule_type column to advisory_rules if not exists
ALTER TABLE advisory_rules ADD COLUMN IF NOT EXISTS rule_type VARCHAR(50);

-- Create advisory_delivery_logs table
CREATE TABLE IF NOT EXISTS advisory_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL,
    rule_id UUID,
    rule_name VARCHAR(255),
    weather_signal VARCHAR(100),
    district VARCHAR(100),
    crop_type VARCHAR(100),
    growth_stage VARCHAR(50),
    delivery_status VARCHAR(50) NOT NULL,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    feedback VARCHAR(50),
    feedback_comment TEXT,
    feedback_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_delivery_log_farmer FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_delivery_log_rule FOREIGN KEY (rule_id) REFERENCES advisory_rules(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_delivery_logs_farmer_id ON advisory_delivery_logs(farmer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_rule_id ON advisory_delivery_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_weather_signal ON advisory_delivery_logs(weather_signal);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_district ON advisory_delivery_logs(district);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_created_at ON advisory_delivery_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_delivery_status ON advisory_delivery_logs(delivery_status);

-- Create index on advisory_rules for rule_type
CREATE INDEX IF NOT EXISTS idx_advisory_rules_rule_type ON advisory_rules(rule_type);

-- Add comments
COMMENT ON TABLE advisory_delivery_logs IS 'Tracks weather advisory delivery and farmer engagement';
COMMENT ON COLUMN advisory_delivery_logs.delivery_status IS 'Status: SENT, DELIVERED, FAILED, OPENED';
COMMENT ON COLUMN advisory_delivery_logs.feedback IS 'Farmer feedback: USEFUL, NOT_USEFUL, NO_FEEDBACK';
