-- Migration: create projects table and add project_id to profiles

-- Enable uuid generation extension (run as superuser if needed)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Projects table: stores per-user project drafts
CREATE TABLE IF NOT EXISTS projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text,
  template_id text,
  data jsonb,
  step integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON projects;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

-- Add project_id column to profiles to point to a current project (nullable)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects(id);

-- Optional indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_template_id ON projects(template_id);

-- Notes:
-- Run this migration against your Supabase/Postgres instance.
-- If your DB requires different UUID extension (uuid-ossp), adjust accordingly.
