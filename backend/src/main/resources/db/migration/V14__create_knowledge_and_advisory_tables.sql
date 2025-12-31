-- Knowledge Base Tables
CREATE TABLE knowledge_categories (
    id UUID PRIMARY KEY,
    name_en VARCHAR(255),
    name_ne VARCHAR(255),
    slug VARCHAR(255) UNIQUE,
    icon_url VARCHAR(255)
);

CREATE TABLE articles (
    id UUID PRIMARY KEY,
    title_en VARCHAR(255),
    title_ne VARCHAR(255),
    content_en TEXT,
    content_ne TEXT,
    category_id UUID REFERENCES knowledge_categories(id),
    status VARCHAR(50), -- DRAFT, PUBLISHED
    tags TEXT[], -- Array of strings
    cover_image_url VARCHAR(255),
    author_id UUID, -- Optional link to admin user
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disease & Pesticide Engine Tables
CREATE TABLE pesticides (
    id UUID PRIMARY KEY,
    name_en VARCHAR(255),
    name_ne VARCHAR(255),
    type VARCHAR(50), -- FUNGICIDE, INSECTICIDE, HERBICIDE
    is_organic BOOLEAN DEFAULT FALSE,
    active_ingredients TEXT,
    safety_instructions_en TEXT,
    safety_instructions_ne TEXT,
    govt_approval_license VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE diseases (
    id UUID PRIMARY KEY,
    name_en VARCHAR(255),
    name_ne VARCHAR(255),
    symptoms_en TEXT,
    symptoms_ne TEXT,
    risk_level VARCHAR(50), -- LOW, HIGH, CRITICAL
    affected_crops TEXT[], -- Array of crop names/types
    trigger_conditions TEXT, -- JSON string storage for flexibility
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE disease_pesticide_recommendations (
    id UUID PRIMARY KEY,
    disease_id UUID REFERENCES diseases(id),
    pesticide_id UUID REFERENCES pesticides(id),
    dosage_per_liter VARCHAR(100),
    spray_interval_days INT,
    is_primary_recommendation BOOLEAN DEFAULT FALSE,
    UNIQUE(disease_id, pesticide_id)
);

-- Advisory Logs (Audit Trail)
CREATE TABLE advisory_logs (
    id UUID PRIMARY KEY,
    farmer_id UUID, -- Nullable for anonymous users
    context VARCHAR(100), -- LISTING_CREATION, MANUAL_SEARCH, WEATHER_ALERT
    recommended_content_id UUID, -- Can refer to article_id or disease_id
    recommended_content_type VARCHAR(50), -- ARTICLE, DISEASE
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_diseases_name ON diseases(name_en);
CREATE INDEX idx_advisory_farmer ON advisory_logs(farmer_id);
