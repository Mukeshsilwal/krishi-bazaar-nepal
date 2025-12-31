-- Create Advisory Rules Table
CREATE TABLE advisory_rules (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    conditions JSONB,
    outcome JSONB,
    status VARCHAR(50) NOT NULL,
    version INT NOT NULL,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index on status
CREATE INDEX idx_rule_status ON advisory_rules(status);
