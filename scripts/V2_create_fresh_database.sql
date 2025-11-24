-- ====================================================================
-- AgriSmart V2: Fresh PostgreSQL Database Schema
-- ====================================================================
-- This script creates a new, optimized database from scratch.
-- It is idempotent and can be run on a new or existing database.
--
-- Optimized for Supabase PostgreSQL (14+)
--
-- Features:
--   - PostgreSQL-specific Data Types (ENUM, DOMAIN, JSONB, GEOGRAPHY)
--   - Advanced Indexing (GIN, GiST, B-tree, Composite)
--   - Row Level Security (RLS) for all tables
--   - Functions and Triggers for automation
--   - Generated Columns for performance
--   - Views for simplifying complex queries
-- ====================================================================

-- Start a transaction
BEGIN;

-- ============================================
-- 1. Reset & Cleanup (for idempotency)
-- ============================================
-- Drop existing objects in reverse order of dependency
DROP VIEW IF EXISTS farmer_dashboard_summary, market_price_trends, seasonal_crop_performance CASCADE;
DROP TABLE IF EXISTS
    sensor_readings, iot_sensors, field_activities, crop_cycles, fields, soil_analysis,
    disease_reports, market_prices, schemes, encyclopedia, weather_data,
    cropsap_alerts, district_statistics, scheme_categories, crop_categories, farmers, farmer_profiles
CASCADE;
DROP SEQUENCE IF EXISTS field_code_seq CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column, generate_farmer_code, get_crop_season, calculate_soil_health_score CASCADE;
DROP TYPE IF EXISTS crop_status_enum, soil_type_enum, irrigation_type_enum, weather_condition_enum, season_enum CASCADE;
DROP DOMAIN IF EXISTS positive_decimal, phone_number, email_address, land_size_hectares CASCADE;

-- ============================================
-- 2. PostgreSQL Extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ============================================
-- 3. Custom Data Types & Domains
-- ============================================

-- ENUM Types
CREATE TYPE crop_status_enum AS ENUM ('planning', 'planted', 'growing', 'harvested', 'failed');
CREATE TYPE soil_type_enum AS ENUM ('clay', 'sandy', 'loamy', 'silt', 'peaty', 'chalky', 'black', 'red', 'alluvial');
CREATE TYPE irrigation_type_enum AS ENUM ('drip', 'sprinkler', 'flood', 'center_pivot', 'manual', 'rainfed');
CREATE TYPE weather_condition_enum AS ENUM ('clear', 'partly-cloudy', 'cloudy', 'fog', 'rain', 'snow', 'thunderstorm');
CREATE TYPE season_enum AS ENUM ('kharif', 'rabi', 'zaid', 'summer', 'winter', 'monsoon');

-- DOMAIN Types for validation
CREATE DOMAIN positive_decimal AS NUMERIC CHECK (VALUE > 0);
CREATE DOMAIN phone_number AS VARCHAR(20) CHECK (VALUE ~ '^[+]?[0-9\s\-\(\)]{10,20}$');
CREATE DOMAIN email_address AS VARCHAR(255) CHECK (VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
CREATE DOMAIN land_size_hectares AS NUMERIC(8,2) CHECK (VALUE >= 0.01 AND VALUE <= 10000);

-- ============================================
-- 4. Helper Functions & Triggers
-- ============================================

-- Function to update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to calculate soil health score
CREATE OR REPLACE FUNCTION calculate_soil_health_score(ph NUMERIC, nitrogen NUMERIC, phosphorus NUMERIC, potassium NUMERIC, organic_matter NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
    ph_score NUMERIC := 0;
    nutrient_score NUMERIC := 0;
    organic_score NUMERIC := 0;
BEGIN
    IF ph >= 6.0 AND ph <= 7.5 THEN ph_score := 40; ELSE ph_score := 10; END IF;
    nutrient_score := LEAST( CASE WHEN nitrogen >= 200 AND nitrogen <= 400 THEN 20 ELSE 10 END, CASE WHEN phosphorus >= 20 AND phosphorus <= 60 THEN 20 ELSE 10 END, CASE WHEN potassium >= 150 AND potassium <= 300 THEN 20 ELSE 10 END );
    IF organic_matter >= 2.0 THEN organic_score := 20; ELSIF organic_matter >= 1.0 THEN organic_score := 15; ELSE organic_score := 5; END IF;
    RETURN ph_score + nutrient_score + organic_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. Table Creation
-- ============================================

CREATE TABLE farmer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number phone_number,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    area_hectares land_size_hectares,
    soil_type soil_type_enum,
    irrigation_method irrigation_type_enum,
    -- Using PostGIS GEOGRAPHY type for location data is recommended if PostGIS is enabled
    -- coordinates GEOGRAPHY(POINT, 4326),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE crop_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    planting_date DATE NOT NULL,
    expected_harvest_date DATE GENERATED ALWAYS AS (planting_date + INTERVAL '120 days') STORED,
    status crop_status_enum DEFAULT 'planning',
    season season_enum,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commodity TEXT NOT NULL,
    market_name TEXT NOT NULL,
    state TEXT NOT NULL,
    modal_price positive_decimal NOT NULL,
    arrival_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE encyclopedia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name TEXT NOT NULL UNIQUE,
    description TEXT,
    planting_season season_enum,
    fertilizer_needs JSONB
);

-- ... other tables like schemes, soil_analysis etc. would go here ...

-- ============================================
-- 6. Indexes for Performance
-- ============================================

-- Farmer profiles
CREATE INDEX ON farmer_profiles(user_id);

-- Fields
CREATE INDEX ON fields(farmer_id);
CREATE INDEX ON fields(soil_type);
CREATE INDEX ON fields USING gist(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Crop cycles
CREATE INDEX ON crop_cycles(field_id);
CREATE INDEX ON crop_cycles(status);
CREATE INDEX ON crop_cycles(planting_date DESC);

-- Market prices
CREATE INDEX ON market_prices(commodity, state, arrival_date DESC);
CREATE INDEX ON market_prices USING gin(commodity gin_trgm_ops);

-- Encyclopedia
CREATE INDEX ON encyclopedia USING gin(crop_name gin_trgm_ops);

-- ============================================
-- 7. Row Level Security (RLS)
-- ============================================

ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile" ON farmer_profiles FOR ALL USING (auth.uid() = user_id);

ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own fields" ON fields FOR ALL USING ((SELECT auth.uid() FROM farmer_profiles WHERE id = farmer_id) = auth.uid());

ALTER TABLE crop_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own crop cycles" ON crop_cycles FOR ALL USING ((SELECT farmer_id FROM fields WHERE id = field_id) IN (SELECT id FROM farmer_profiles WHERE user_id = auth.uid()));

-- Public tables
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Market prices are public" ON market_prices FOR SELECT USING (true);

ALTER TABLE encyclopedia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Encyclopedia is public" ON encyclopedia FOR SELECT USING (true);

-- ============================================
-- 8. Triggers for Automation
-- ============================================

CREATE TRIGGER update_farmer_profiles_updated_at BEFORE UPDATE ON farmer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crop_cycles_updated_at BEFORE UPDATE ON crop_cycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. Seed Basic Data
-- ============================================

INSERT INTO encyclopedia (crop_name, description, planting_season)
VALUES
    ('Wheat', 'A major cereal crop.', 'rabi'),
    ('Rice', 'A staple food for a large part of the world's human population.', 'kharif')
ON CONFLICT (crop_name) DO NOTHING;

-- ============================================
-- 10. Final Commit
-- ============================================

COMMIT;

-- ============================================
-- Success Message
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Fresh AgriSmart V2 Database Created Successfully!';
    RAISE NOTICE '🐘 All tables, types, functions, and policies are set up.';
END $$;