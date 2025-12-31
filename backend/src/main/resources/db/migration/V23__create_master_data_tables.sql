-- Create Master Categories Table
CREATE TABLE IF NOT EXISTS master_categories (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Master Items Table
CREATE TABLE IF NOT EXISTS master_items (
    id UUID PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES master_categories(id),
    code VARCHAR(50) NOT NULL,
    label_en VARCHAR(255) NOT NULL,
    label_ne VARCHAR(255),
    description TEXT,
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, code)
);

-- Index for faster lookups
CREATE INDEX idx_master_items_category ON master_items(category_id);
CREATE INDEX idx_master_items_code ON master_items(code);
