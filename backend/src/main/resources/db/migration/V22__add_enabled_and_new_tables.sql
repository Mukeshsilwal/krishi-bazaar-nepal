-- Add enabled column to users if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='enabled') THEN
        ALTER TABLE users ADD COLUMN enabled BOOLEAN DEFAULT TRUE NOT NULL;
    END IF;
END $$;

-- Create Weather Advisories Table if not exists
CREATE TABLE IF NOT EXISTS weather_advisories (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    region VARCHAR(255) NOT NULL,
    alert_level VARCHAR(50) NOT NULL,
    valid_until TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Government Schemes Table if not exists
CREATE TABLE IF NOT EXISTS government_schemes (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    eligibility_criteria VARCHAR(255) NOT NULL,
    application_deadline DATE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
