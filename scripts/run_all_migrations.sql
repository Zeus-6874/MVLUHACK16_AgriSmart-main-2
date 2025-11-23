-- Complete Database Migration Script
-- Run this entire script in Supabase SQL Editor to set up all tables
-- Make sure to run in order or run this complete script

-- ============================================
-- 1. Base Schema (001_create_database_schema.sql)
-- ============================================

-- Create farmers table for user profiles
CREATE TABLE IF NOT EXISTS public.farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  farm_size DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create encyclopedia table for crop information
CREATE TABLE IF NOT EXISTS public.encyclopedia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name TEXT NOT NULL,
  scientific_name TEXT,
  description TEXT,
  planting_season TEXT,
  harvest_time TEXT,
  water_requirements TEXT,
  soil_type TEXT,
  fertilizer_needs TEXT,
  common_diseases TEXT[],
  prevention_tips TEXT[],
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schemes table for government schemes (old structure - will be replaced)
CREATE TABLE IF NOT EXISTS public.schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_name TEXT NOT NULL,
  description TEXT,
  eligibility TEXT,
  benefits TEXT,
  application_process TEXT,
  contact_info TEXT,
  state TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create market_prices table (old structure - will be replaced)
CREATE TABLE IF NOT EXISTS public.market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name TEXT NOT NULL,
  market_name TEXT NOT NULL,
  price_per_quintal DECIMAL NOT NULL,
  unit TEXT DEFAULT 'quintal',
  date DATE NOT NULL,
  state TEXT,
  district TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crop_varieties table
CREATE TABLE IF NOT EXISTS public.crop_varieties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID REFERENCES public.market_prices(id),
  variety_name TEXT NOT NULL,
  quality_grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create weather_data table
CREATE TABLE IF NOT EXISTS public.weather_data (
  location TEXT NOT NULL,
  temperature DECIMAL,
  humidity DECIMAL,
  rainfall DECIMAL,
  wind_speed DECIMAL,
  weather_condition TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create soil_analysis table
CREATE TABLE IF NOT EXISTS public.soil_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmers(id),
  nitrogen_level DECIMAL NOT NULL,
  phosphorus_level DECIMAL NOT NULL,
  potassium_level DECIMAL NOT NULL,
  ph_level DECIMAL NOT NULL,
  organic_matter DECIMAL,
  recommendations JSONB,
  suitable_crops TEXT[],
  location TEXT,
  season TEXT,
  rainfall DECIMAL,
  temperature DECIMAL,
  analysis_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create disease_reports table
CREATE TABLE IF NOT EXISTS public.disease_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmers(id),
  crop_name TEXT NOT NULL,
  disease_name TEXT,
  confidence_score DECIMAL,
  image_url TEXT,
  symptoms JSONB,
  treatment_recommendations JSONB,
  reported_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Auth Integration (003_update_schema_for_auth.sql)
-- ============================================

-- Update farmers table to reference auth.users
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- 3. Market Data Schema (004_create_market_data_schema.sql)
-- ============================================

-- Create market_price_sources table
CREATE TABLE IF NOT EXISTS market_price_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  source_type text not null default 'agmarknet',
  source_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Update market_prices table with new structure
-- Note: This creates a new structure. Old data may need migration.
CREATE TABLE IF NOT EXISTS market_prices_new (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references market_price_sources(id) on delete set null,
  commodity text not null,
  commodity_hi text,
  variety text,
  market_name text,
  state text not null,
  district text,
  arrival_date date not null,
  min_price numeric,
  max_price numeric,
  modal_price numeric,
  unit text default 'quintal',
  created_at timestamptz not null default now(),
  unique (commodity, market_name, arrival_date)
);

CREATE TABLE IF NOT EXISTS market_price_history (
  id uuid primary key default gen_random_uuid(),
  market_price_id uuid references market_prices_new(id) on delete cascade,
  fetched_at timestamptz not null default now(),
  payload jsonb not null
);

CREATE INDEX IF NOT EXISTS idx_market_prices_state ON market_prices_new(state);
CREATE INDEX IF NOT EXISTS idx_market_prices_commodity ON market_prices_new(commodity);
CREATE INDEX IF NOT EXISTS idx_market_prices_arrival_date ON market_prices_new(arrival_date);

-- ============================================
-- 4. Knowledge Base Schema (005_create_knowledge_schema.sql) ⚠️ REQUIRED
-- ============================================

CREATE TABLE IF NOT EXISTS scheme_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- Update existing schemes table to new structure
-- Add new columns if they don't exist
ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS name_local text;
ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS category_id uuid references scheme_categories(id) on delete set null;
ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS subsidy_details text;
ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS official_url text;
ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS last_updated date default current_date;

-- Update existing columns to match new structure
-- If scheme_name exists, copy to name
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schemes' AND column_name = 'scheme_name') THEN
    UPDATE public.schemes SET name = scheme_name WHERE name IS NULL;
  END IF;
END $$;

-- Rename scheme_name to name if it exists and name doesn't
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schemes' AND column_name = 'scheme_name')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schemes' AND column_name = 'name') THEN
    ALTER TABLE public.schemes RENAME COLUMN scheme_name TO name;
  END IF;
END $$;

-- Set default state if not exists
ALTER TABLE public.schemes ALTER COLUMN state SET DEFAULT 'All India';

CREATE INDEX IF NOT EXISTS idx_schemes_state ON public.schemes(state);
CREATE INDEX IF NOT EXISTS idx_schemes_category ON public.schemes(category_id);

CREATE TABLE IF NOT EXISTS crop_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

CREATE TABLE IF NOT EXISTS crops (
  id uuid primary key default gen_random_uuid(),
  common_name text not null,
  local_name text,
  scientific_name text,
  category_id uuid references crop_categories(id) on delete set null,
  climate text,
  soil_type text,
  optimal_ph_range text,
  water_requirements text,
  fertilizer_requirements text,
  planting_season text,
  harvest_time text,
  average_yield text,
  diseases text[],
  disease_management text,
  market_demand text,
  image_url text,
  source text,
  created_at timestamptz not null default now(),
  unique (common_name, scientific_name)
);

CREATE TABLE IF NOT EXISTS crop_notes (
  id uuid primary key default gen_random_uuid(),
  crop_id uuid references crops(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- ============================================
-- 5. Farmer Profiles (006_create_farmer_profiles.sql)
-- ============================================

CREATE TABLE IF NOT EXISTS farmer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  farm_name text,
  land_size numeric,
  primary_crop text,
  irrigation_method text,
  location text,
  contact_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 6. CROPSAP & District Stats (007_create_cropsap_schema.sql)
-- ============================================

CREATE TABLE IF NOT EXISTS cropsap_alerts (
  id uuid primary key default gen_random_uuid(),
  reference_id text,
  state text not null default 'Maharashtra',
  district text,
  taluka text,
  village text,
  crop text not null,
  pest text,
  disease text,
  severity text,
  advisory text,
  reported_on date,
  source_url text,
  created_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS idx_cropsap_district ON cropsap_alerts(district);
CREATE INDEX IF NOT EXISTS idx_cropsap_crop ON cropsap_alerts(crop);

CREATE TABLE IF NOT EXISTS district_statistics (
  id uuid primary key default gen_random_uuid(),
  state text not null default 'Maharashtra',
  district text not null,
  taluka text,
  season text,
  crop text,
  area_ha numeric,
  production_mt numeric,
  yield_mt_per_ha numeric,
  rainfall_mm numeric,
  irrigation_coverage_percent numeric,
  horticulture_area_ha numeric,
  medicinal_plants_area_ha numeric,
  source text,
  recorded_year integer,
  created_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS idx_district_statistics_district ON district_statistics(district);
CREATE INDEX IF NOT EXISTS idx_district_statistics_crop ON district_statistics(crop);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encyclopedia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_varieties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cropsap_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE district_statistics ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow public read for most tables)
CREATE POLICY IF NOT EXISTS "Allow public read access" ON scheme_categories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access" ON public.schemes FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access" ON crop_categories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access" ON crops FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access" ON cropsap_alerts FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access" ON district_statistics FOR SELECT USING (true);

-- ============================================
-- Migration Complete!
-- ============================================

-- Verify tables were created
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'scheme_categories', 'schemes', 'crop_categories', 'crops',
      'cropsap_alerts', 'district_statistics', 'farmer_profiles'
    );
  
  RAISE NOTICE 'Created % required tables. Run seed scripts now!', table_count;
END $$;

