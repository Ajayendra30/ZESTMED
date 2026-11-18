-- ==============================================================================
-- ZESTMED HEALTHCARE - SUPABASE POSTGRESQL DATABASE SCHEMA
-- ==============================================================================
-- Migration script replacing previous SQLite database (zestmed.db) with
-- production-grade Supabase PostgreSQL schema with RLS and seed data.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES & ROLES (Patients, Staff, Admins)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supabase_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    age INTEGER,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    address TEXT,
    city VARCHAR(100) DEFAULT 'Guwahati',
    state VARCHAR(100) DEFAULT 'Assam',
    pincode VARCHAR(10),
    role VARCHAR(50) DEFAULT 'PATIENT',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(50) NOT NULL DEFAULT 'Home',
    street VARCHAR(255) NOT NULL,
    area VARCHAR(150),
    city VARCHAR(100) NOT NULL DEFAULT 'Guwahati',
    state VARCHAR(100) NOT NULL DEFAULT 'Assam',
    pincode VARCHAR(10) NOT NULL,
    landmark VARCHAR(150),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. MEDICINES & PHARMACY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medicine_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(100),
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    manufacturer VARCHAR(150),
    category_id UUID REFERENCES public.medicine_categories(id) ON DELETE SET NULL,
    prescription_required BOOLEAN DEFAULT FALSE,
    dosage_form VARCHAR(50) DEFAULT 'Tablet',
    pack_size VARCHAR(100),
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount_percentage NUMERIC(5, 2) DEFAULT 0,
    discounted_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 100,
    description TEXT,
    composition TEXT,
    uses TEXT,
    side_effects TEXT,
    image_url VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    patient_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Guwahati',
    state VARCHAR(100) DEFAULT 'Assam',
    pincode VARCHAR(10),
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(10, 2) DEFAULT 0,
    delivery_fee NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(30) DEFAULT 'Pending',
    payment_method VARCHAR(50) DEFAULT 'Cash on Delivery',
    order_status VARCHAR(50) DEFAULT 'Processing',
    items JSONB DEFAULT '[]'::jsonb,
    tracking_status VARCHAR(100) DEFAULT 'Order Placed',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES public.medicines(id) ON DELETE SET NULL,
    medicine_name VARCHAR(200) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. DIAGNOSTICS & LAB SERVICES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.diagnostic_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    preparation VARCHAR(255),
    sample_type VARCHAR(100) DEFAULT 'Blood',
    turnaround_time VARCHAR(100) DEFAULT '12-24 Hours',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount_percentage NUMERIC(5, 2) DEFAULT 0,
    discounted_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    parameters TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.health_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sample_type VARCHAR(100) DEFAULT 'Blood & Urine',
    turnaround_time VARCHAR(100) DEFAULT '24 Hours',
    fasting_required BOOLEAN DEFAULT TRUE,
    total_tests_count INTEGER DEFAULT 1,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount_percentage NUMERIC(5, 2) DEFAULT 0,
    discounted_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    tags TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lab_executives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    hub_city VARCHAR(100) DEFAULT 'Guwahati',
    operating_zone VARCHAR(100) DEFAULT 'Dispur & GS Road Hub',
    vehicle_number VARCHAR(50),
    cold_box_telemetry VARCHAR(50) DEFAULT '3.8°C',
    certification VARCHAR(150) DEFAULT 'NABL Certified Phlebotomist',
    is_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.test_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    patient_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    test_id UUID REFERENCES public.diagnostic_tests(id) ON DELETE SET NULL,
    test_name VARCHAR(200) NOT NULL,
    sample_type VARCHAR(100) DEFAULT 'Blood',
    collection_address TEXT NOT NULL,
    collection_date DATE NOT NULL,
    collection_slot VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Pending Collection',
    phlebotomist VARCHAR(150),
    report_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. DOCTOR APPOINTMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctor_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_number VARCHAR(50) UNIQUE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    patient_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    doctor_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(50) NOT NULL,
    consultation_type VARCHAR(50) DEFAULT 'Clinic Visit',
    status VARCHAR(50) DEFAULT 'Confirmed',
    fees NUMERIC(10, 2) NOT NULL DEFAULT 500,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. PHYSIOTHERAPY BOOKINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.physiotherapy_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    patient_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    condition VARCHAR(200) NOT NULL,
    service_type VARCHAR(100) DEFAULT 'Home Visit',
    booking_date DATE NOT NULL,
    preferred_slot VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Confirmed',
    fees NUMERIC(10, 2) NOT NULL DEFAULT 799,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. SURGERY PACKAGES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.surgery_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    patient_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    surgery_name VARCHAR(200) NOT NULL,
    hospital_preference VARCHAR(200) DEFAULT 'ZestMed SuperSpecialty Center',
    preferred_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Consultation Scheduled',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    insurance_support BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. WELLNESS PACKAGES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wellness_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    patient_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    package_name VARCHAR(200) NOT NULL,
    booking_date DATE NOT NULL,
    preferred_slot VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Confirmed',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. CONTACT INQUIRIES & AUDIT LOGS
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physiotherapy_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgery_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_executives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public read access to catalog data (medicines, tests, packages)
CREATE POLICY "Public can view medicines" ON public.medicines FOR SELECT USING (true);
CREATE POLICY "Public can view tests" ON public.diagnostic_tests FOR SELECT USING (true);
CREATE POLICY "Public can view packages" ON public.health_packages FOR SELECT USING (true);
CREATE POLICY "Public can view categories" ON public.medicine_categories FOR SELECT USING (true);

-- Allow authenticated / anon users to create bookings and orders
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Users can update their orders" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Users can create test bookings" ON public.test_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view test bookings" ON public.test_bookings FOR SELECT USING (true);
CREATE POLICY "Users can update test bookings" ON public.test_bookings FOR UPDATE USING (true);

CREATE POLICY "Users can create doctor appointments" ON public.doctor_appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view doctor appointments" ON public.doctor_appointments FOR SELECT USING (true);
CREATE POLICY "Users can update doctor appointments" ON public.doctor_appointments FOR UPDATE USING (true);

CREATE POLICY "Users can create physio bookings" ON public.physiotherapy_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view physio bookings" ON public.physiotherapy_bookings FOR SELECT USING (true);
CREATE POLICY "Users can update physio bookings" ON public.physiotherapy_bookings FOR UPDATE USING (true);

CREATE POLICY "Users can create surgery bookings" ON public.surgery_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view surgery bookings" ON public.surgery_bookings FOR SELECT USING (true);
CREATE POLICY "Users can update surgery bookings" ON public.surgery_bookings FOR UPDATE USING (true);

CREATE POLICY "Users can create wellness bookings" ON public.wellness_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view wellness bookings" ON public.wellness_bookings FOR SELECT USING (true);
CREATE POLICY "Users can update wellness bookings" ON public.wellness_bookings FOR UPDATE USING (true);

CREATE POLICY "Allow profile operations" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow lab executives operations" ON public.lab_executives FOR ALL USING (true);
CREATE POLICY "Allow inquiries operations" ON public.inquiries FOR ALL USING (true);

-- ------------------------------------------------------------------------------
-- 10. INITIAL SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO public.roles (name, description) VALUES
    ('PATIENT', 'Patient Access Role'),
    ('LAB_EXECUTIVE', 'Lab Executive & Phlebotomist Role'),
    ('ADMIN', 'Super Administrator Role')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.profiles (phone, full_name, email, role) VALUES
    ('9279125091', 'ZestMed Super Administrator', 'admin@zestmed.in', 'ADMIN'),
    ('9279128888', 'Rajib Barman (Lead Phlebotomist)', 'rajib.barman@zestmed.in', 'LAB_EXECUTIVE')
ON CONFLICT (phone) DO NOTHING;

INSERT INTO public.lab_executives (employee_id, full_name, phone, hub_city, operating_zone, vehicle_number) VALUES
    ('LE-8888', 'Rajib Barman', '9279128888', 'Guwahati', 'Dispur & GS Road Hub', 'AS-01-ZM-8888')
ON CONFLICT (employee_id) DO NOTHING;
