-- Create Master Crop Types Table
CREATE TABLE master_crop_types (
    id UUID PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL UNIQUE,
    name_ne VARCHAR(100) NOT NULL,
    icon_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create Administrative Units Table
CREATE TABLE master_administrative_units (
    id UUID PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_ne VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- PROVINCE, DISTRICT, MUNICIPALITY
    parent_id UUID,
    FOREIGN KEY (parent_id) REFERENCES master_administrative_units(id)
);

CREATE INDEX idx_admin_unit_type ON master_administrative_units(type);
CREATE INDEX idx_admin_unit_parent ON master_administrative_units(parent_id);
