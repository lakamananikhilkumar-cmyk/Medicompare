-- ==============================================================================
-- MediCompare — Supabase PostgreSQL Schema & Migration Script
-- Run this script in your Supabase SQL Editor to initialize all tables, RLS, & seed data.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create Storage Bucket for Prescriptions (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prescriptions',
  'prescriptions',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Allow public read and authenticated/anon uploads
CREATE POLICY "Public Prescriptions Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'prescriptions');

CREATE POLICY "Public Prescriptions Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'prescriptions');

-- 1. PROFILES TABLE (Mirrors Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  city VARCHAR(100),
  pincode VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MEDICINES TABLE
CREATE TABLE IF NOT EXISTS public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  brand_name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255) NOT NULL,
  composition TEXT NOT NULL,
  strength VARCHAR(100) NOT NULL,
  dosage_form VARCHAR(50) NOT NULL,
  pack_size VARCHAR(100) NOT NULL,
  prescription_required BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PHARMACIES TABLE
CREATE TABLE IF NOT EXISTS public.pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  opening_time TIME NOT NULL DEFAULT '08:00:00',
  closing_time TIME NOT NULL DEFAULT '22:00:00',
  is_24_hours BOOLEAN DEFAULT FALSE,
  rating NUMERIC(2, 1) DEFAULT 4.5 CHECK (rating >= 1.0 AND rating <= 5.0),
  total_ratings INT DEFAULT 0,
  delivery_available BOOLEAN DEFAULT FALSE,
  delivery_radius_km NUMERIC(5, 2) DEFAULT 5.0,
  pickup_available BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  mrp NUMERIC(10, 2) NOT NULL CHECK (mrp >= price),
  availability VARCHAR(20) DEFAULT 'in_stock' CHECK (availability IN ('in_stock', 'low_stock', 'out_of_stock')),
  stock_quantity INT DEFAULT 100 CHECK (stock_quantity >= 0),
  batch_number VARCHAR(100),
  expiry_date DATE,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_medicine_pharmacy UNIQUE (medicine_id, pharmacy_id)
);

-- 5. PRICE HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. USER FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_medicine_favorite UNIQUE (user_id, medicine_id)
);

-- 7. SEARCH HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  search_query VARCHAR(255) NOT NULL,
  search_type VARCHAR(50) DEFAULT 'medicine',
  results_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Public Read Policies for Medicines & Pharmacies
CREATE POLICY "Public Read Medicines" ON public.medicines FOR SELECT USING (true);
CREATE POLICY "Public Read Pharmacies" ON public.pharmacies FOR SELECT USING (true);
CREATE POLICY "Public Read Inventory" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Public Read Price History" ON public.price_history FOR SELECT USING (true);

-- User Profile Policies
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_supa_medicines_name ON public.medicines (name);
CREATE INDEX IF NOT EXISTS idx_supa_medicines_generic ON public.medicines (generic_name);
CREATE INDEX IF NOT EXISTS idx_supa_medicines_brand ON public.medicines (brand_name);
CREATE INDEX IF NOT EXISTS idx_supa_inventory_medicine ON public.inventory (medicine_id);
CREATE INDEX IF NOT EXISTS idx_supa_inventory_pharmacy ON public.inventory (pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_supa_inventory_price ON public.inventory (price);
