-- Fix Flyway Migration Conflict
-- This script removes the problematic V999 migration record
-- Run this in your PostgreSQL database client (pgAdmin, DBeaver, etc.)

DELETE FROM flyway_schema_history WHERE version = '999';

-- Verify the deletion
SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;
