-- V10__create_logistics_tables.sql

CREATE TABLE cold_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    district VARCHAR(50) NOT NULL,
    capacity DOUBLE PRECISION NOT NULL, -- in kg or tons
    available_capacity DOUBLE PRECISION NOT NULL,
    contact_number VARCHAR(15),
    price_per_kg_per_day DECIMAL(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logistics_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL, -- TRUCK, VAN, PICKUP
    driver_name VARCHAR(100),
    driver_mobile VARCHAR(15),
    pickup_time TIMESTAMP,
    delivery_time TIMESTAMP,
    status VARCHAR(20) NOT NULL, -- PENDING, ASSIGNED, IN_TRANSIT, DELIVERED
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_logistics_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX idx_cold_storage_district ON cold_storage(district);
CREATE INDEX idx_logistics_order_status ON logistics_orders(status);
