-- Migration: convert profiles.project_id to uuid[] (array)

-- If profiles.project_id doesn't exist, create it as uuid[]
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='profiles' AND column_name='project_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN project_id uuid[];
  ELSE
    -- if exists but not an array, try to convert
    PERFORM 1 FROM information_schema.columns
      WHERE table_name='profiles' AND column_name='project_id' AND data_type='ARRAY';
    IF NOT FOUND THEN
      -- Attempt to convert scalar uuid -> uuid[] by wrapping existing values
      ALTER TABLE profiles ALTER COLUMN project_id SET DATA TYPE uuid[] USING CASE WHEN project_id IS NULL THEN NULL ELSE ARRAY[project_id] END;
    END IF;
  END IF;
END$$;

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_profiles_project_id ON profiles USING GIN (project_id);

-- Notes:
-- Run this migration against your Supabase/Postgres instance. If your DB requires different permissions, run via Supabase SQL editor.
