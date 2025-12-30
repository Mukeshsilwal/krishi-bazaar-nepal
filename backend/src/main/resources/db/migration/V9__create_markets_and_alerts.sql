-- V9__create_markets_and_alerts.sql

-- Create markets table
CREATE TABLE markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    district VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create price_alerts table
CREATE TABLE price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Assuming linked to users table, but keeping loose coupling for now or add FK if users table is stable
    crop_name VARCHAR(100) NOT NULL,
    target_price DECIMAL(10,2) NOT NULL,
    condition VARCHAR(20) NOT NULL, -- 'ABOVE', 'BELOW'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_price_alerts_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add market_id to market_prices table
ALTER TABLE market_prices ADD COLUMN market_id UUID;
ALTER TABLE market_prices ADD CONSTRAINT fk_market_prices_market FOREIGN KEY (market_id) REFERENCES markets(id);

CREATE INDEX idx_markets_district ON markets(district);
CREATE INDEX idx_price_alerts_user ON price_alerts(user_id);
