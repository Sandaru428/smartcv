-- Migration: drop old profiles.project_id column
-- This safely removes the legacy scalar/array column and any associated index/foreign key.
-- Run this after migrating data into `profile_projects` and verifying everything.

BEGIN;

-- 1) If there's a foreign key constraint on profiles.project_id, drop it
DO $$
DECLARE
  fk_name text;
BEGIN
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'profiles' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'project_id'
  LIMIT 1;

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE profiles DROP CONSTRAINT %I', fk_name);
  END IF;
END$$;

-- 2) Drop any index that might exist on the column
DROP INDEX IF EXISTS idx_profiles_project_id;
DROP INDEX IF EXISTS idx_profiles_project_id_gin;

-- 3) Finally drop the column if it exists
ALTER TABLE profiles DROP COLUMN IF EXISTS project_id;

COMMIT;

-- Notes:
-- - Backup your DB before running this migration.
-- - Run via psql or Supabase SQL editor as an admin user.
-- - After this migration completes, the only canonical relationship between profiles and projects
--   should be through the `profile_projects` join table which has proper foreign keys.
