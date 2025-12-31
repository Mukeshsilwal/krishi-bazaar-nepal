-- Enable UUID extension if not enabled (usually enabled by default in Spring Boot setups or previous migrations)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to insert category if not exists
INSERT INTO master_categories (id, code, name, description) VALUES
(uuid_generate_v4(), 'CROP_TYPE', 'Crop Types', 'Different types of crops (Cereals, Pulses, etc.)'),
(uuid_generate_v4(), 'SEASON', 'Seasons', 'Agricultural seasons in Nepal'),
(uuid_generate_v4(), 'SOIL_TYPE', 'Soil Types', 'Types of soil found in different regions'),
(uuid_generate_v4(), 'IRRIGATION', 'Irrigation Methods', 'Methods used for watering crops'),
(uuid_generate_v4(), 'FERTILIZER', 'Fertilizer Types', 'Types of fertilizers used'),
(uuid_generate_v4(), 'MARKET_TYPE', 'Market Types', 'Types of markets (Wholesale, Retail, Haat)'),
(uuid_generate_v4(), 'SCHEME_CATEGORY', 'Govt Scheme Categories', 'Categories of government schemes');

-- Insert Crop Types
WITH cat AS (SELECT id FROM master_categories WHERE code = 'CROP_TYPE')
INSERT INTO master_items (id, category_id, code, label_en, label_ne, sort_order) VALUES
(uuid_generate_v4(), (SELECT id FROM cat), 'RICE', 'Rice', 'धान', 1),
(uuid_generate_v4(), (SELECT id FROM cat), 'WHEAT', 'Wheat', 'गहुँ', 2),
(uuid_generate_v4(), (SELECT id FROM cat), 'MAIZE', 'Maize', 'मकै', 3),
(uuid_generate_v4(), (SELECT id FROM cat), 'POTATO', 'Potato', 'आलु', 4),
(uuid_generate_v4(), (SELECT id FROM cat), 'SUGARCANE', 'Sugarcane', 'उखु', 5);

-- Insert Seasons
WITH cat AS (SELECT id FROM master_categories WHERE code = 'SEASON')
INSERT INTO master_items (id, category_id, code, label_en, label_ne, sort_order) VALUES
(uuid_generate_v4(), (SELECT id FROM cat), 'KHARIF', 'Kharif (Monsoon)', 'बर्खे (मनसुन)', 1),
(uuid_generate_v4(), (SELECT id FROM cat), 'RABI', 'Rabi (Winter)', 'हिउँदे', 2),
(uuid_generate_v4(), (SELECT id FROM cat), 'ZAID', 'Zaid (Spring)', 'वसन्त', 3);

-- Insert Soil Types
WITH cat AS (SELECT id FROM master_categories WHERE code = 'SOIL_TYPE')
INSERT INTO master_items (id, category_id, code, label_en, label_ne, sort_order) VALUES
(uuid_generate_v4(), (SELECT id FROM cat), 'ALLUVIAL', 'Alluvial Soil', 'अल्लुवियल माटो', 1),
(uuid_generate_v4(), (SELECT id FROM cat), 'RED', 'Red Soil', 'रातो माटो', 2),
(uuid_generate_v4(), (SELECT id FROM cat), 'BLACK', 'Black Soil', 'कालो माटो', 3),
(uuid_generate_v4(), (SELECT id FROM cat), 'SANDY', 'Sandy Soil', 'बलौटे माटो', 4);

-- Insert Irrigation Methods
WITH cat AS (SELECT id FROM master_categories WHERE code = 'IRRIGATION')
INSERT INTO master_items (id, category_id, code, label_en, label_ne, sort_order) VALUES
(uuid_generate_v4(), (SELECT id FROM cat), 'DRIP', 'Drip Irrigation', 'थोपा सिँचाइ', 1),
(uuid_generate_v4(), (SELECT id FROM cat), 'SPRINKLER', 'Sprinkler', 'फोहरा सिँचाइ', 2),
(uuid_generate_v4(), (SELECT id FROM cat), 'FLOOD', 'Flood Irrigation', 'बहाव सिँचाइ', 3);

-- Insert Fertilizer Types
WITH cat AS (SELECT id FROM master_categories WHERE code = 'FERTILIZER')
INSERT INTO master_items (id, category_id, code, label_en, label_ne, sort_order) VALUES
(uuid_generate_v4(), (SELECT id FROM cat), 'UREA', 'Urea', 'य युरिया', 1),
(uuid_generate_v4(), (SELECT id FROM cat), 'DAP', 'DAP', 'डिएपी', 2),
(uuid_generate_v4(), (SELECT id FROM cat), 'POTASH', 'Potash', 'पोटास', 3),
(uuid_generate_v4(), (SELECT id FROM cat), 'ORGANIC', 'Organic Compost', 'प्राङ्गारिक मल', 4);

-- Insert Market Types
WITH cat AS (SELECT id FROM master_categories WHERE code = 'MARKET_TYPE')
INSERT INTO master_items (id, category_id, code, label_en, label_ne, sort_order) VALUES
(uuid_generate_v4(), (SELECT id FROM cat), 'WHOLESALE', 'Wholesale Market', 'थोक बजार', 1),
(uuid_generate_v4(), (SELECT id FROM cat), 'RETAIL', 'Retail Shop', 'खुद्रा पसल', 2),
(uuid_generate_v4(), (SELECT id FROM cat), 'HAAT', 'Haat Bazaar', 'हाट बजार', 3);

-- Insert Scheme Categories
WITH cat AS (SELECT id FROM master_categories WHERE code = 'SCHEME_CATEGORY')
INSERT INTO master_items (id, category_id, code, label_en, label_ne, sort_order) VALUES
(uuid_generate_v4(), (SELECT id FROM cat), 'SUBSIDY', 'Subsidy', 'अनुदान', 1),
(uuid_generate_v4(), (SELECT id FROM cat), 'LOAN', 'Agriculture Loan', 'कृषि ऋण', 2),
(uuid_generate_v4(), (SELECT id FROM cat), 'INSURANCE', 'Crop Insurance', 'बाली बीमा', 3),
(uuid_generate_v4(), (SELECT id FROM cat), 'TRAINING', 'Training & Support', 'तालिम र सहयोग', 4);
