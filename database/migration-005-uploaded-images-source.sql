-- Migration 005: add source_type and external_url to uploaded_images
-- Run in Supabase SQL Editor.

ALTER TABLE uploaded_images
  ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'supabase',
  ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Only add the constraint if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uploaded_images_source_type_check'
  ) THEN
    ALTER TABLE uploaded_images
      ADD CONSTRAINT uploaded_images_source_type_check
      CHECK (source_type IN ('supabase', 'external'));
  END IF;
END $$;
