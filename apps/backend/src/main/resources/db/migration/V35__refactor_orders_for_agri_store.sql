-- Refactor orders table
ALTER TABLE orders ADD COLUMN order_source VARCHAR(20) DEFAULT 'MARKETPLACE';
ALTER TABLE orders ALTER COLUMN listing_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN farmer_id DROP NOT NULL;

-- Create order_items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    agri_product_id UUID,
    quantity DECIMAL(10, 2) NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_order_items_agri_product FOREIGN KEY (agri_product_id) REFERENCES agri_products(id)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Update existing orders to have MARKETPLACE source (default already handles applied to new rows, but for existing:)
UPDATE orders SET order_source = 'MARKETPLACE' WHERE order_source IS NULL;
ALTER TABLE orders ALTER COLUMN order_source SET NOT NULL;
