-- ====================================================================
-- AgriSmart V2: Fresh PostgreSQL Database Schema (COMPLETE)
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
    cropsap_alerts, district_statistics, scheme_categories, crop_categories, farmer_profiles
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
CREATE DOMAIN phone_number AS VARCHAR(20) CHECK (VALUE ~ '^[+]?[0-9\s\-\(\)]{10,20}$' OR VALUE IS NULL);
CREATE DOMAIN email_address AS VARCHAR(255) CHECK (VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
CREATE DOMAIN land_size_hectares AS NUMERIC(8,2) CHECK (VALUE >= 0.01 AND VALUE <= 10000);

-- ============================================
-- 4. Helper Functions & Triggers
-- ============================================

-- Function to update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to calculate soil health score
CREATE OR REPLACE FUNCTION calculate_soil_health_score(ph NUMERIC, nitrogen NUMERIC, phosphorus NUMERIC, potassium NUMERIC, organic_matter NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
    RETURN CASE WHEN ph >= 6.0 AND ph <= 7.5 THEN 40 ELSE 10 END +
           LEAST(
               CASE WHEN nitrogen >= 200 AND nitrogen <= 400 THEN 20 ELSE 10 END,
               CASE WHEN phosphorus >= 20 AND phosphorus <= 60 THEN 20 ELSE 10 END,
               CASE WHEN potassium >= 150 AND potassium <= 300 THEN 20 ELSE 10 END
           ) +
           CASE WHEN organic_matter >= 2.0 THEN 20 WHEN organic_matter >= 1.0 THEN 15 ELSE 5 END;
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
    area_acres NUMERIC(8,2) GENERATED ALWAYS AS (area_hectares * 2.47105) STORED,
    soil_type soil_type_enum,
    irrigation_method irrigation_type_enum,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    boundary_polygon JSONB,
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
    actual_yield NUMERIC(8,2),
    input_cost NUMERIC(10,2),
    revenue NUMERIC(10,2),
    profit_margin NUMERIC(5,2) GENERATED ALWAYS AS (CASE WHEN input_cost > 0 THEN ((revenue - input_cost) / input_cost * 100) ELSE NULL END) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE soil_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    sample_date DATE NOT NULL,
    ph_level DECIMAL(4,2) CHECK (ph_level > 0 AND ph_level < 14),
    nitrogen NUMERIC(6,2),
    phosphorus NUMERIC(6,2),
    potassium NUMERIC(6,2),
    organic_matter NUMERIC(5,2) CHECK (organic_matter >= 0),
    health_score NUMERIC(5,2) GENERATED ALWAYS AS (calculate_soil_health_score(ph_level, nitrogen, phosphorus, potassium, organic_matter)) STORED,
    recommendations JSONB,
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
    fertilizer_needs JSONB,
    common_diseases TEXT[],
    image_url TEXT
);

CREATE TABLE schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    eligibility TEXT[],
    benefits JSONB,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- 6. Indexes for Performance
-- ============================================

CREATE INDEX ON farmer_profiles(user_id);
CREATE INDEX ON fields(farmer_id);
CREATE INDEX ON fields USING gist(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX ON crop_cycles(field_id);
CREATE INDEX ON crop_cycles(status);
CREATE INDEX ON soil_analysis(field_id);
CREATE INDEX ON market_prices(commodity, state, arrival_date DESC);
CREATE INDEX ON market_prices USING gin(commodity gin_trgm_ops);
CREATE INDEX ON encyclopedia USING gin(crop_name gin_trgm_ops);
CREATE INDEX ON schemes USING gin(name gin_trgm_ops);

-- ============================================
-- 7. Row Level Security (RLS)
-- ============================================

ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile" ON farmer_profiles FOR ALL USING (auth.uid() = user_id);

ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own fields" ON fields FOR ALL USING ((SELECT user_id FROM farmer_profiles WHERE id = farmer_id) = auth.uid());

ALTER TABLE crop_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own crop cycles" ON crop_cycles FOR ALL USING ((SELECT fp.user_id FROM fields f JOIN farmer_profiles fp ON f.farmer_id = fp.id WHERE f.id = field_id) = auth.uid());

ALTER TABLE soil_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own soil analysis" ON soil_analysis FOR ALL USING ((SELECT fp.user_id FROM fields f JOIN farmer_profiles fp ON f.farmer_id = fp.id WHERE f.id = field_id) = auth.uid());

-- Public tables
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Market prices are public" ON market_prices FOR SELECT USING (true);

ALTER TABLE encyclopedia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Encyclopedia is public" ON encyclopedia FOR SELECT USING (true);

ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Schemes are public" ON schemes FOR SELECT USING (true);

-- ============================================
-- 8. Triggers for Automation
-- ============================================

CREATE TRIGGER update_farmer_profiles_updated_at BEFORE UPDATE ON farmer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crop_cycles_updated_at BEFORE UPDATE ON crop_cycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_soil_analysis_updated_at BEFORE UPDATE ON soil_analysis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. Views for Simplified Queries
-- ============================================

CREATE OR REPLACE VIEW farmer_dashboard_summary AS
SELECT
    p.id as farmer_id,
    p.full_name,
    p.location,
    COUNT(f.id) as total_fields,
    SUM(f.area_hectares) as total_area,
    (SELECT COUNT(*) FROM crop_cycles WHERE field_id IN (SELECT id FROM fields WHERE farmer_id = p.id) AND status = 'growing') as active_crops
FROM farmer_profiles p
LEFT JOIN fields f ON p.id = f.farmer_id
GROUP BY p.id;

-- ============================================
-- 10. Seed Basic Data
-- ============================================

INSERT INTO encyclopedia (crop_name, description, planting_season, fertilizer_needs) VALUES
    ('Wheat', 'A major cereal crop, grown in temperate climates.', 'rabi', '{"N": 120, "P": 60, "K": 40}'),
    ('Rice', 'A staple food for over half of the world''s population.', 'kharif', '{"N": 150, "P": 75, "K": 60}'),
    ('Maize', 'Known as corn, a versatile crop used for food, feed, and fuel.', 'kharif', '{"N": 180, "P": 80, "K": 70}')
ON CONFLICT (crop_name) DO NOTHING;

INSERT INTO schemes (name, description, eligibility, benefits) VALUES
    ('PM-KISAN', 'A central sector scheme with 100% funding from Government of India.', '["Small and marginal farmers"]', '{"financial_aid": "Rs. 6,000 per year"}'),
    ('Soil Health Card', 'A scheme to provide farmers with information on the nutrient status of their soil.', '["All farmers"]', '{"soil_testing": "Free", "recommendations": "Customized"}')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 11. Final Commit
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