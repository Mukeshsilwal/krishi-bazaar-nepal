CREATE TABLE agriculture_calendar (
    id UUID PRIMARY KEY,
    crop VARCHAR(50) NOT NULL,
    nepali_month VARCHAR(20) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    region VARCHAR(100),
    advisory TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    created_by UUID,
    updated_by UUID
);

CREATE INDEX idx_calendar_crop_month ON agriculture_calendar (crop, nepali_month);

-- Seed Initial Data for Paddy (Rice)
INSERT INTO agriculture_calendar (id, crop, nepali_month, activity_type, region, advisory, created_at, active) VALUES
(gen_random_uuid(), 'PADDY', 'ASHADH', 'TRANSPLANTING', 'ALL', 'Optimum time for transplanting paddy. Maintain 2-3 cm water level.', NOW(), TRUE),
(gen_random_uuid(), 'PADDY', 'SHRAWAN', 'GROWTH', 'ALL', 'Weeding and top dressing of urea required.', NOW(), TRUE),
(gen_random_uuid(), 'PADDY', 'KARTIK', 'HARVESTING', 'ALL', 'Harvest when 90% of grains turn golden yellow.', NOW(), TRUE);

-- Seed Initial Data for Maize
INSERT INTO agriculture_calendar (id, crop, nepali_month, activity_type, region, advisory, created_at, active) VALUES
(gen_random_uuid(), 'MAIZE', 'CHAITRA', 'SOWING', 'HILL', 'Sow maize seeds with proper spacing. Apply basal dose of fertilizers.', NOW(), TRUE),
(gen_random_uuid(), 'MAIZE', 'BAISAKH', 'GROWTH', 'HILL', 'First weeding and earthing up should be done.', NOW(), TRUE);

-- Seed Initial Data for Wheat
INSERT INTO agriculture_calendar (id, crop, nepali_month, activity_type, region, advisory, created_at, active) VALUES
(gen_random_uuid(), 'WHEAT', 'MANGSIR', 'SOWING', 'TERAI', 'Sow wheat seeds. Treat seeds with fungicides before sowing.', NOW(), TRUE),
(gen_random_uuid(), 'WHEAT', 'POUSH', 'IRRIGATION', 'TERAI', 'First irrigation at crown root initiation stage (21 days after sowing).', NOW(), TRUE);
