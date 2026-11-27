-- ==============================================================================
-- ZESTMED HEALTHCARE - SUPABASE STORAGE & LAB TESTS RLS MIGRATION
-- ==============================================================================
-- Migration to configure Supabase Storage bucket 'lab-tests' and database RLS
-- policies for diagnostic tests catalog management and permanent image persistence.
-- Run this script in the Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/axkjlnbycmcxfhstzbxd/sql
-- ==============================================================================

-- 1. Create or configure the public 'lab-tests' storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'lab-tests',
    'lab-tests',
    true,
    10485760, -- 10MB file size limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Configure Storage Object RLS Policies for 'lab-tests' bucket
DROP POLICY IF EXISTS "Public can view lab test images" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload lab test images" ON storage.objects;
DROP POLICY IF EXISTS "Allow update lab test images" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete lab test images" ON storage.objects;

-- Allow public read access to all lab test images in the 'lab-tests' bucket
CREATE POLICY "Public can view lab test images"
ON storage.objects FOR SELECT
USING (bucket_id = 'lab-tests');

-- Allow anon and authenticated users to upload lab test images
CREATE POLICY "Allow upload lab test images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lab-tests');

-- Allow anon and authenticated users to update/replace lab test images
CREATE POLICY "Allow update lab test images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'lab-tests');

-- Allow anon and authenticated users to delete lab test images
CREATE POLICY "Allow delete lab test images"
ON storage.objects FOR DELETE
USING (bucket_id = 'lab-tests');

-- 3. Configure Table Schema & Database RLS Policies on 'public.diagnostic_tests' Table
ALTER TABLE public.diagnostic_tests ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.diagnostic_tests ADD COLUMN IF NOT EXISTS mrp NUMERIC(10, 2) DEFAULT 0;

ALTER TABLE public.diagnostic_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view tests" ON public.diagnostic_tests;
DROP POLICY IF EXISTS "Users can create tests" ON public.diagnostic_tests;
DROP POLICY IF EXISTS "Users can update tests" ON public.diagnostic_tests;
DROP POLICY IF EXISTS "Users can delete tests" ON public.diagnostic_tests;

CREATE POLICY "Public can view tests"
ON public.diagnostic_tests FOR SELECT
USING (true);

CREATE POLICY "Users can create tests"
ON public.diagnostic_tests FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update tests"
ON public.diagnostic_tests FOR UPDATE
USING (true);

CREATE POLICY "Users can delete tests"
ON public.diagnostic_tests FOR DELETE
USING (true);
