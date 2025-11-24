-- AgriSmart Complete Database Migration Script
-- Run this entire script in Supabase SQL Editor to set up all tables
-- Execute in Supabase SQL Editor: https://supabase.com/dashboard/project/sql

-- ============================================
-- Enable required extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Farmer Profiles (006_create_farmer_profiles.sql)
-- ============================================

CREATE TABLE IF NOT EXISTS farmer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  farm_name TEXT,
  land_size NUMERIC,
  primary_crop TEXT,
  irrigation_method TEXT,
  location TEXT,
  contact_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Core Agricultural Data Tables
-- ============================================

-- Encyclopedia table for crop information
CREATE TABLE IF NOT EXISTS encyclopedia (
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

-- Government schemes table
CREATE TABLE IF NOT EXISTS schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_local TEXT,
  description TEXT,
  eligibility TEXT,
  benefits TEXT,
  application_process TEXT,
  contact_info TEXT,
  state TEXT DEFAULT 'All India',
  category TEXT,
  department TEXT,
  subsidy_details TEXT,
  official_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market prices table
CREATE TABLE IF NOT EXISTS market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity TEXT NOT NULL,
  commodity_hi TEXT,
  market_name TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT,
  arrival_date DATE NOT NULL,
  min_price NUMERIC,
  max_price NUMERIC,
  modal_price NUMERIC,
  unit TEXT DEFAULT 'quintal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weather data table
CREATE TABLE IF NOT EXISTS weather_data (
  location TEXT NOT NULL,
  temperature NUMERIC,
  humidity NUMERIC,
  rainfall NUMERIC,
  wind_speed NUMERIC,
  weather_condition TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Soil analysis table
CREATE TABLE IF NOT EXISTS soil_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID,
  nitrogen_level NUMERIC NOT NULL,
  phosphorus_level NUMERIC NOT NULL,
  potassium_level NUMERIC NOT NULL,
  ph_level NUMERIC NOT NULL,
  organic_matter NUMERIC,
  recommendations JSONB,
  suitable_crops TEXT[],
  location TEXT,
  season TEXT,
  rainfall NUMERIC,
  temperature NUMERIC,
  analysis_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disease reports table
CREATE TABLE IF NOT EXISTS disease_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID,
  crop_name TEXT NOT NULL,
  disease_name TEXT,
  confidence_score NUMERIC,
  image_url TEXT,
  symptoms JSONB,
  treatment_recommendations JSONB,
  reported_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. CROPSAP & District Agricultural Statistics
-- ============================================

CREATE TABLE IF NOT EXISTS cropsap_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL DEFAULT 'Maharashtra',
  district TEXT,
  taluka TEXT,
  village TEXT,
  crop TEXT NOT NULL,
  pest TEXT,
  disease TEXT,
  severity TEXT,
  advisory TEXT,
  reported_on DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS district_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL DEFAULT 'Maharashtra',
  district TEXT NOT NULL,
  taluka TEXT,
  season TEXT,
  crop TEXT,
  area_ha NUMERIC,
  production_mt NUMERIC,
  yield_mt_per_ha NUMERIC,
  rainfall_mm NUMERIC,
  irrigation_coverage_percent NUMERIC,
  recorded_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. Market Data Management
-- ============================================

CREATE TABLE IF NOT EXISTS market_price_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  source_type TEXT NOT NULL DEFAULT 'agmarknet',
  source_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. Knowledge Base
-- ============================================

CREATE TABLE IF NOT EXISTS scheme_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crop_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name TEXT NOT NULL,
  local_name TEXT,
  scientific_name TEXT,
  category_id UUID REFERENCES crop_categories(id) ON DELETE SET NULL,
  climate TEXT,
  soil_type TEXT,
  optimal_ph_range TEXT,
  water_requirements TEXT,
  fertilizer_requirements TEXT,
  planting_season TEXT,
  harvest_time TEXT,
  average_yield TEXT,
  diseases TEXT[],
  disease_management TEXT,
  market_demand TEXT,
  image_url TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (common_name, scientific_name)
);

-- ============================================
-- 6. Advanced Field Management (Phase 1)
-- ============================================

-- Fields table for spatial farm management
CREATE TABLE IF NOT EXISTS fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  area_hectares DECIMAL NOT NULL,
  coordinates JSONB,
  soil_type TEXT,
  irrigation_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crop cycles table for seasonal tracking
CREATE TABLE IF NOT EXISTS crop_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  variety TEXT,
  planting_date DATE,
  expected_harvest_date DATE,
  actual_harvest_date DATE,
  status TEXT, -- planning, planted, growing, harvested
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field activities table for task tracking
CREATE TABLE IF NOT EXISTS field_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE CASCADE,
  activity_type TEXT, -- planting, fertilizing, irrigation, harvesting
  activity_date DATE,
  materials_used JSONB,
  cost DECIMAL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. IoT Sensor Infrastructure (Phase 2 - Ready for Future Implementation)
-- ============================================

CREATE TABLE IF NOT EXISTS iot_sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
  field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
  sensor_type TEXT NOT NULL, -- moisture, temperature, ph, humidity, light, nitrogen
  sensor_id TEXT UNIQUE NOT NULL,
  sensor_model TEXT,
  manufacturer TEXT,
  location JSONB,
  installation_date DATE,
  last_maintenance DATE,
  status TEXT DEFAULT 'inactive', -- active, inactive, maintenance, error
  battery_level DECIMAL,
  signal_strength DECIMAL,
  calibration_data JSONB,
  configuration JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES public.iot_sensors(id) ON DELETE CASCADE,
  reading_value DECIMAL NOT NULL,
  unit TEXT,
  raw_data JSONB,
  quality_score DECIMAL DEFAULT 1.0,
  anomaly_detected BOOLEAN DEFAULT FALSE,
  anomaly_details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. Create Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_farmer_profiles_user_id ON public.farmer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_soil_analysis_farmer_id ON public.soil_analysis(farmer_id);
CREATE INDEX IF NOT EXISTS idx_disease_reports_farmer_id ON public.disease_reports(farmer_id);
CREATE INDEX IF NOT EXISTS idx_fields_farmer_id ON public.fields(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crop_cycles_field_id ON public.crop_cycles(field_id);
CREATE IF NOT EXISTS idx_field_activities_crop_cycle_id ON public.field_activities(crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id ON public.sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON public.sensor_readings(timestamp);
CREATE INDEX IF NOT EXISTS idx_market_prices_state ON public.market_prices(state);
CREATE INDEX IF NOT EXISTS idx_market_prices_commodity ON public.market_prices(commodity);
CREATE INDEX IF NOT EXISTS idx_market_prices_arrival_date ON public.market_prices(arrival_date);
CREATE INDEX IF NOT EXISTS idx_schemes_state ON public.schemes(state);
CREATE INDEX IF NOT EXISTS idx_cropsap_district ON public.cropsap_alerts(district);
CREATE INDEX IF NOT EXISTS idx_district_statistics_district ON public.district_statistics(district);

-- ============================================
-- 9. Enable Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encyclopedia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cropsap_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. Create RLS Policies
-- ============================================

-- Farmer-specific policies
CREATE POLICY IF NOT EXISTS "farmers_own_profiles" ON public.farmer_profiles FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY IF NOT EXISTS "farmers_own_soil_analysis" ON public.soil_analysis FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = soil_analysis.farmer_id
    AND auth.uid()::text = farmer_profiles.user_id
  )
);

CREATE POLICY IF NOT EXISTS "farmers_own_disease_reports" ON public.disease_reports FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = disease_reports.farmer_id
    AND auth.uid()::text = farmer_profiles.user_id
  )
);

-- Field management policies
CREATE POLICY IF NOT EXISTS "farmers_own_fields" ON public.fields FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = fields.farmer_id
    AND auth.uid()::text = farmer_profiles.user_id
  )
);

CREATE POLICY IF NOT EXISTS "farmers_own_crop_cycles" ON public.crop_cycles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.fields
    JOIN public.farmer_profiles ON farmer_profiles.id = fields.farmer_id
    WHERE fields.id = crop_cycles.field_id
    AND auth.uid()::text = farmer_profiles.user_id
  )
);

CREATE POLICY IF NOT EXISTS "farmers_own_field_activities" ON public.field_activities FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.crop_cycles
    JOIN public.fields ON fields.id = crop_cycles.field_id
    JOIN public.farmer_profiles ON farmer_profiles.id = fields.farmer_id
    WHERE crop_cycles.id = field_activities.crop_cycle_id
    AND auth.uid()::text = farmer_profiles.user_id
  )
);

-- IoT sensor policies
CREATE POLICY IF NOT EXISTS "farmers_own_iot_sensors" ON public.iot_sensors FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.farmer_profiles
    WHERE farmer_profiles.id = iot_sensors.farmer_id
    AND auth.uid()::text = farmer_profiles.user_id
  )
);

CREATE POLICY IF NOT EXISTS "farmers_own_sensor_readings" ON public.sensor_readings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.iot_sensors
    WHERE iot_sensors.id = sensor_readings.sensor_id
    AND iot_sensors.farmer_id IN (
      SELECT id FROM public.farmer_profiles WHERE auth.uid()::text = user_id
    )
  )
);

-- Public read policies
CREATE POLICY IF NOT EXISTS "public_read_encyclopedia" ON public.encyclopedia FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "public_read_schemes" ON public.schemes FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "public_read_market_prices" ON public.market_prices FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "public_read_weather_data" ON public.weather_data FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "public_read_cropsap_alerts" ON public.cropsap_alerts FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "public_read_district_statistics" ON public.district_statistics FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "public_read_scheme_categories" ON public.scheme_categories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "public_read_crop_categories" ON public.crop_categories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "public_read_crops" ON public.crops FOR SELECT USING (true);

-- ============================================
-- 11. Create Update Timestamp Function
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_farmer_profiles_updated_at BEFORE UPDATE ON public.farmer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_soil_analysis_updated_at BEFORE UPDATE ON public.soil_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schemes_updated_at BEFORE UPDATE ON public.schemes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON public.fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crop_cycles_updated_at BEFORE UPDATE ON public.crop_cycles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_iot_sensors_updated_at BEFORE UPDATE ON public.iot_sensors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 12. Migration Complete Verification
-- ============================================

DO $$
DECLARE
  table_count INTEGER;
  important_tables TEXT[] := ARRAY[
    'farmer_profiles', 'soil_analysis', 'disease_reports',
    'fields', 'crop_cycles', 'field_activities',
    'encyclopedia', 'schemes', 'market_prices',
    'cropsap_alerts', 'district_statistics',
    'crop_categories', 'crops', 'iot_sensors', 'sensor_readings'
  ];
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name = ANY(important_tables);

  RAISE NOTICE 'Successfully created % AgriSmart database tables!', table_count;
  RAISE NOTICE 'Database is now ready for the application!';

  -- Create some sample scheme categories if empty
  IF NOT EXISTS (SELECT 1 FROM scheme_categories LIMIT 1) THEN
    INSERT INTO scheme_categories (name, description) VALUES
    ('Crop Insurance', 'Insurance schemes for crop protection against natural calamities'),
    ('Credit Facilities', 'Agricultural loans and credit facilities for farmers'),
    ('Subsidies', 'Direct subsidy schemes for farmers on agricultural inputs'),
    ('Technology', 'Schemes promoting agricultural technology and modernization'),
    ('Market Support', 'Price support and market development schemes');
  END IF;
END $$;

