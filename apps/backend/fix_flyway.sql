-- Fix Flyway migration issue by deleting the failed migration record
DELETE FROM flyway_schema_history WHERE version = '20260117122349' AND success = false;
