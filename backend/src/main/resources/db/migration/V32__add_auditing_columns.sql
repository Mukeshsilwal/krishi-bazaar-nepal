-- Add auditing columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Add auditing columns to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Update Order Status Constraint to include new statuses
-- Dropping the constraint using the standard naming convention. 
-- If the name differs in this environment, this might fail, but standard Postgres maps inline CHECK to table_column_check.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('PENDING', 'CONFIRMED', 'PAYMENT_PENDING', 'PAID', 'READY_FOR_HARVEST', 'HARVESTED', 'READY', 'COMPLETED', 'CANCELLED'));
