-- V12__create_ai_logs.sql

CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL,
    query_text TEXT,
    image_url VARCHAR(255),
    crop_name VARCHAR(100),
    disease_detected VARCHAR(100),
    confidence_score DOUBLE PRECISION,
    recommendation TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_farmer ON ai_recommendations(farmer_id);
