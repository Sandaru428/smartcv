-- Safe migration: convert `profiles.project_id` scalar uuid (with FK) into uuid[] array
-- This migration will:
-- 1) drop any foreign-key constraint that references profiles.project_id -> projects.id
-- 2) convert the scalar uuid column into an array of uuid, preserving existing values
-- 3) create a GIN index to support array queries
-- IMPORTANT: Run this migration only after you've backed up your database (or on dev), and ensure your Supabase RLS/policies permit the operations.

BEGIN;

-- 1) Drop FK constraint on profiles.project_id if it exists (we don't re-create FK because Postgres does not support FK on array elements)
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

-- 2) If project_id column does not exist, add it as uuid[] (rare case)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='profiles' AND column_name='project_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN project_id uuid[];
  ELSE
    -- If it exists, and already an array, nothing to do. If scalar, convert to uuid[] by wrapping values
    PERFORM 1 FROM information_schema.columns
      WHERE table_name='profiles' AND column_name='project_id' AND data_type='ARRAY';
    IF NOT FOUND THEN
      ALTER TABLE profiles ALTER COLUMN project_id TYPE uuid[] USING CASE WHEN project_id IS NULL THEN NULL ELSE ARRAY[project_id] END;
    END IF;
  END IF;
END$$;

-- 3) Create a GIN index on the array for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_project_id_gin ON profiles USING GIN (project_id);

COMMIT;

-- Notes/after-migration:
-- - There is no direct foreign key from array elements to the projects table. If you need referential integrity, consider creating a separate join table (e.g. profile_projects(profile_id uuid, project_id uuid, PRIMARY KEY (profile_id, project_id))) and migrate data there.
-- - If you already ran the earlier migration that created a scalar project_id referencing projects(id), running this file will drop that FK and convert the column into an array.
-- - If you use Supabase RLS, ensure the migration is run by an admin (or via SQL editor) and that subsequent app logic updates policies accordingly.
