-- ==============================================================================
-- ZESTMED HEALTHCARE - SUPABASE STORAGE & MEDICINES RLS MIGRATION
-- ==============================================================================
-- Migration to configure Supabase Storage bucket 'medicines' and database RLS
-- policies for medicines catalog management and permanent image persistence.
-- Run this script in the Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/axkjlnbycmcxfhstzbxd/sql
-- ==============================================================================

-- 1. Create or configure the public 'medicines' storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'medicines',
    'medicines',
    true,
    10485760, -- 10MB file size limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Configure Storage Object RLS Policies for 'medicines' bucket
DROP POLICY IF EXISTS "Public can view medicine images" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload medicine images" ON storage.objects;
DROP POLICY IF EXISTS "Allow update medicine images" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete medicine images" ON storage.objects;

-- Allow public read access to all medicine images in the 'medicines' bucket
CREATE POLICY "Public can view medicine images"
ON storage.objects FOR SELECT
USING (bucket_id = 'medicines');

-- Allow anon and authenticated users to upload medicine images
CREATE POLICY "Allow upload medicine images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'medicines');

-- Allow anon and authenticated users to update/replace medicine images
CREATE POLICY "Allow update medicine images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'medicines');

-- Allow anon and authenticated users to delete medicine images
CREATE POLICY "Allow delete medicine images"
ON storage.objects FOR DELETE
USING (bucket_id = 'medicines');

-- 3. Configure Database RLS Policies on 'public.medicines' Table
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view medicines" ON public.medicines;
DROP POLICY IF EXISTS "Allow medicine read" ON public.medicines;
DROP POLICY IF EXISTS "Allow medicine insert" ON public.medicines;
DROP POLICY IF EXISTS "Allow medicine update" ON public.medicines;
DROP POLICY IF EXISTS "Allow medicine delete" ON public.medicines;
DROP POLICY IF EXISTS "Allow all operations on medicines" ON public.medicines;

-- Allow public read access to medicines catalog
CREATE POLICY "Allow medicine read"
ON public.medicines FOR SELECT
USING (true);

-- Allow inserting medicines from Admin Dashboard
CREATE POLICY "Allow medicine insert"
ON public.medicines FOR INSERT
WITH CHECK (true);

-- Allow updating medicines from Admin Dashboard
CREATE POLICY "Allow medicine update"
ON public.medicines FOR UPDATE
USING (true);

-- Allow deleting medicines from Admin Dashboard
CREATE POLICY "Allow medicine delete"
ON public.medicines FOR DELETE
USING (true);
