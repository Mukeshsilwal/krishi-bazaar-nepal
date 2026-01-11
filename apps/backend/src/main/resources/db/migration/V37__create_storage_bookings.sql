CREATE TABLE storage_bookings (
    id UUID PRIMARY KEY,
    cold_storage_id UUID NOT NULL,
    farmer_id UUID NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DOUBLE PRECISION,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_storage_booking_storage FOREIGN KEY (cold_storage_id) REFERENCES cold_storage(id),
    CONSTRAINT fk_storage_booking_farmer FOREIGN KEY (farmer_id) REFERENCES users(id) -- Assuming users table holds farmers
);

CREATE INDEX idx_storage_bookings_storage ON storage_bookings(cold_storage_id);
CREATE INDEX idx_storage_bookings_farmer ON storage_bookings(farmer_id);
