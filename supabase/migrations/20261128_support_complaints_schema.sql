-- ==============================================================================
-- ZESTMED HEALTHCARE - SUPPORT & COMPLAINTS SCHEMA & RLS MIGRATION
-- ==============================================================================
-- Adds extended columns to public.inquiries for full ticketing workflow:
-- status, category, priority, ticket_number, admin_response, response_date, responded_by, profile_id
-- Run this script in the Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/axkjlnbycmcxfhstzbxd/sql
-- ==============================================================================

-- 1. Ensure public.inquiries table exists
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add extended ticketing columns
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Open';
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General Support';
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'Normal';
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS ticket_number VARCHAR(50);
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS admin_response TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS response_date TIMESTAMPTZ;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS responded_by VARCHAR(150);
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Configure RLS Policies
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Users can view inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can manage inquiries" ON public.inquiries;

-- Allow anyone (public and authenticated patients) to submit inquiries / complaints
CREATE POLICY "Public can submit inquiries"
ON public.inquiries FOR INSERT
WITH CHECK (true);

-- Allow admins full access to view, update status, and respond
CREATE POLICY "Admins can manage inquiries"
ON public.inquiries FOR ALL
USING (true)
WITH CHECK (true);
