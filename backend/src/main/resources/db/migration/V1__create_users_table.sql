-- V1__create_users_table.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('FARMER', 'BUYER', 'VENDOR', 'ADMIN')),
    name VARCHAR(100),
    email VARCHAR(100),
    district VARCHAR(50),
    ward VARCHAR(10),
    land_size DECIMAL(10,2),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_mobile ON users(mobile_number);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_district ON users(district);
