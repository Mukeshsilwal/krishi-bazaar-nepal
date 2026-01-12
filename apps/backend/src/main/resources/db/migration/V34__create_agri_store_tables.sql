CREATE TABLE agri_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    brand VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    stock_quantity INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    image_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

CREATE INDEX idx_agri_products_category ON agri_products(category);
CREATE INDEX idx_agri_products_is_active ON agri_products(is_active);

-- Seed Initial Data
INSERT INTO agri_products (name, category, description, brand, price, unit, stock_quantity, is_active, created_at) VALUES 
('Hybrid Tomato Seeds', 'SEEDS', 'High yield hybrid tomato seeds suitable for terai region.', 'Nepal Seeds', 150.00, 'PACK', 500, TRUE, CURRENT_TIMESTAMP),
('DAP Fertilizer', 'FERTILIZERS', 'Di-ammonium Phosphate fertilizer for root development.', 'Salt Trading', 2500.00, 'BAG', 100, TRUE, CURRENT_TIMESTAMP),
('Organic Neem Oil', 'PESTICIDES', 'Organic pesticide for controlling aphids and whiteflies.', 'EcoAgri', 450.00, 'BOTTLE', 200, TRUE, CURRENT_TIMESTAMP),
('Sickle (Hasiya)', 'TOOLS', 'Traditional iron sickle for harvesting.', 'Local Smith', 300.00, 'PIECE', 50, TRUE, CURRENT_TIMESTAMP);
