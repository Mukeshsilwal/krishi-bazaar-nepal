-- V8__create_market_prices_table.sql
CREATE TABLE market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_name VARCHAR(100) NOT NULL,
    district VARCHAR(50) NOT NULL,
    min_price DECIMAL(10,2) NOT NULL,
    max_price DECIMAL(10,2) NOT NULL,
    avg_price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    price_date DATE NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_market_prices_crop ON market_prices(crop_name);
CREATE INDEX idx_market_prices_district ON market_prices(district);
CREATE INDEX idx_market_prices_date ON market_prices(price_date DESC);
CREATE INDEX idx_market_prices_crop_district ON market_prices(crop_name, district, price_date DESC);
