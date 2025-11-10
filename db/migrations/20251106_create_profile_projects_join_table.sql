-- Migration: create profile_projects join table and migrate data from profiles.project_id array

BEGIN;

-- 1) Create join table if not exists
CREATE TABLE IF NOT EXISTS profile_projects (
  profile_id uuid NOT NULL,
  project_id uuid NOT NULL,
  PRIMARY KEY (profile_id, project_id)
);

-- 2) Add foreign key constraints (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'profile_projects' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'profile_id'
  ) THEN
    ALTER TABLE profile_projects ADD CONSTRAINT fk_profileprojects_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'profile_projects' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'project_id'
  ) THEN
    ALTER TABLE profile_projects ADD CONSTRAINT fk_profileprojects_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;
END$$;

-- 3) Migrate existing values from profiles.project_id (array) into the join table
-- Only insert distinct pairs to avoid duplicates
INSERT INTO profile_projects (profile_id, project_id)
SELECT p.id AS profile_id, unnest(p.project_id) AS project_id
FROM profiles p
WHERE p.project_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 4) Create index to help lookup by project_id
CREATE INDEX IF NOT EXISTS idx_profile_projects_project_id ON profile_projects(project_id);

COMMIT;

-- Notes:
-- - This migration will create a join table with proper foreign keys that Supabase will surface as relationships in the UI.
-- - After this migration the relationships will be visible in Supabase's table view.
-- - Optionally you can remove the denormalized `profiles.project_id` column after verifying the migration, but keeping it may be convenient for some queries.
