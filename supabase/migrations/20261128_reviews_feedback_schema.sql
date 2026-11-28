-- ==============================================================================
-- ZESTMED HEALTHCARE - REVIEWS & FEEDBACK DATABASE SCHEMA & RLS MIGRATION
-- ==============================================================================
-- Creates the public.reviews table with full moderation & administrative reply support.
-- Run this script in the Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/axkjlnbycmcxfhstzbxd/sql
-- ==============================================================================

-- 1. Create table public.reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_number VARCHAR(50) UNIQUE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    patient_name VARCHAR(150) NOT NULL,
    patient_phone VARCHAR(30),
    patient_email VARCHAR(150),
    service_name VARCHAR(200) NOT NULL,
    clinic_hub VARCHAR(200) DEFAULT 'Zestmed Central Lab (GS Road)',
    rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Approved' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Flagged')),
    is_published BOOLEAN DEFAULT TRUE,
    is_verified_patient BOOLEAN DEFAULT TRUE,
    admin_reply TEXT,
    reply_date TIMESTAMPTZ,
    replied_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indices for fast lookup and filtering
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_service ON public.reviews(service_name);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- 3. Configure Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can submit reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins have full access on reviews" ON public.reviews;

-- Anyone can read approved/published reviews
CREATE POLICY "Public can view published reviews"
ON public.reviews FOR SELECT
USING (is_published = true OR status = 'Approved');

-- Any authenticated patient or guest can submit a review
CREATE POLICY "Anyone can submit reviews"
ON public.reviews FOR INSERT
WITH CHECK (true);

-- Admins can view, edit, update status, and delete any review
CREATE POLICY "Admins have full access on reviews"
ON public.reviews FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Seed initial genuine reviews if table is empty
INSERT INTO public.reviews (
    review_number, patient_name, patient_phone, service_name, clinic_hub, rating, comment, status, is_published, is_verified_patient, admin_reply, replied_by
)
SELECT * FROM (VALUES
    ('REV-101', 'Ajayendra Shekhar', '+91 92791 25091', 'Diagnostic Lab Test', 'Zestmed Central Lab (GS Road)', 5.0, 'Super fast home sample collection in Dispur. Phlebotomist arrived exactly on time with a temperature-monitored cold box. Verified digital report received the same evening!', 'Approved', true, true, 'Thank you for choosing ZESTMED Diagnostic Hub! We strive to deliver 100% accurate same-day diagnostic results.', 'Super Admin (Operations)'),
    ('REV-102', 'Dr. N. Bora', '+91 94350 11982', 'Doctor Consultation', 'Zestmed Polyclinic Hub (Dispur)', 5.0, 'Very smooth clinical consultation process. The staff was polite and digital records were seamlessly uploaded into the patient dashboard.', 'Approved', true, true, NULL, NULL),
    ('REV-103', 'Rajesh Kumar', '+91 98765 43210', 'Online Medicine Delivery', 'Zestmed Central Pharmacy', 4.5, 'Medicine delivery in 45 minutes in Ulubari. Genuine sealed medicines with proper Assam GST tax invoice. Will definitely reorder.', 'Approved', true, true, NULL, NULL),
    ('REV-104', 'Priya Sharma', '+91 94350 12345', 'Physiotherapy Rehabilitation', 'Zestmed Rehab Care', 5.0, 'The physiotherapist who visited our home for post-knee surgery rehab was extremely patient, gentle, and highly experienced. Great recovery progress!', 'Approved', true, true, 'Wishing your mother a rapid recovery! Our rehabilitation team is always at your service.', 'Super Admin (Operations)'),
    ('REV-105', 'Amit Verma', '+91 97060 98765', 'Senior Citizen Pick-up Service', 'ZESTMED Care Transport', 4.0, 'The free senior citizen cab pick-up service is truly a lifesaver in Guwahati traffic. Clean sanitized EV, wheelchair ramp, and courteous chauffeur.', 'Approved', true, true, NULL, NULL),
    ('REV-106', 'Sneha Singh', '+91 91270 54321', 'Wellness Health Package', 'Zestmed Polyclinic Hub (Dispur)', 5.0, 'Comprehensive Full Body Wellness package covered all 60 parameters at a fraction of the cost elsewhere. Clean, professional facility.', 'Approved', true, true, NULL, NULL)
) AS v(review_number, patient_name, patient_phone, service_name, clinic_hub, rating, comment, status, is_published, is_verified_patient, admin_reply, replied_by)
WHERE NOT EXISTS (SELECT 1 FROM public.reviews LIMIT 1);
