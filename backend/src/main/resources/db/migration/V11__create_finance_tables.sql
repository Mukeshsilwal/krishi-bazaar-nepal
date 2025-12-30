-- V11__create_finance_tables.sql

CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    provider VARCHAR(100), -- Bank Name
    interest_rate DECIMAL(5,2),
    duration_months INTEGER,
    status VARCHAR(20) NOT NULL, -- PENDING, APPROVED, REJECTED, DISBURSED
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    coverage_amount DECIMAL(15,2) NOT NULL,
    premium_amount DECIMAL(15,2) NOT NULL,
    policy_number VARCHAR(50),
    provider VARCHAR(100),
    status VARCHAR(20) NOT NULL, -- ACTIVE, EXPIRED, CLAIMED
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subsidies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    govt_body VARCHAR(100),
    amount DECIMAL(15,2),
    deadline DATE,
    eligibility_criteria TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loans_farmer ON loans(farmer_id);
CREATE INDEX idx_insurance_farmer ON insurance_policies(farmer_id);
