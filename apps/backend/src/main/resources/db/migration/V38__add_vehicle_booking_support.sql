-- Migration: Add buyerId column to shipments table and create vehicle_bookings table
-- Purpose: Support post-payment shipment creation and vehicle booking functionality

-- Add buyerId column to existing shipments table
ALTER TABLE shipments ADD COLUMN buyer_id UUID;

-- Add foreign key constraint
ALTER TABLE shipments ADD CONSTRAINT fk_shipment_buyer 
    FOREIGN KEY (buyer_id) REFERENCES users(id);

-- Add unique constraint on order_id to prevent duplicate shipments
ALTER TABLE shipments ADD CONSTRAINT uk_shipment_order_id UNIQUE (order_id);

-- Create index for buyer queries
CREATE INDEX idx_shipments_buyer_id ON shipments(buyer_id);

-- Create vehicle_bookings table
CREATE TABLE vehicle_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL UNIQUE,
    vehicle_type VARCHAR(20) NOT NULL,
    driver_name VARCHAR(100),
    driver_contact VARCHAR(20),
    vehicle_number VARCHAR(20),
    estimated_cost DECIMAL(10,2),
    pickup_datetime TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_booking_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
);

-- Create indexes for vehicle_bookings
CREATE INDEX idx_vehicle_bookings_shipment_id ON vehicle_bookings(shipment_id);
CREATE INDEX idx_vehicle_bookings_status ON vehicle_bookings(status);

-- Add comments for documentation
COMMENT ON TABLE vehicle_bookings IS 'Stores vehicle booking information for shipments';
COMMENT ON COLUMN vehicle_bookings.vehicle_type IS 'Type of vehicle: TRACTOR, PICKUP, TRUCK, TEMPO, MINI_TRUCK';
COMMENT ON COLUMN vehicle_bookings.status IS 'Booking status: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED';
COMMENT ON COLUMN shipments.buyer_id IS 'Denormalized buyer ID for quick ownership validation';
