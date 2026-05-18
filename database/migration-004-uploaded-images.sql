-- Migration 004: uploaded_images table
-- Run this in Supabase SQL Editor before enabling image uploads.
--
-- Also required in Supabase Dashboard → Storage:
--   1. Create bucket named "product-images" (Public bucket)
--   2. Add policy: allow authenticated service role to INSERT/SELECT
--   3. Add env vars to Vercel:
--        SUPABASE_URL          = https://<project-ref>.supabase.co
--        SUPABASE_SERVICE_ROLE_KEY = <service role key from Project Settings → API>

CREATE TABLE IF NOT EXISTS uploaded_images (
  id           SERIAL PRIMARY KEY,
  filename     TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  medium_url   TEXT NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
