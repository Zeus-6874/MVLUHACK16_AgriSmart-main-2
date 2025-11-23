-- Updated schema to match API route requirements
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

-- Create schemes table for government schemes
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

-- Updated market_prices table to match API expectations
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

-- Added crop_varieties table as referenced in API
CREATE TABLE IF NOT EXISTS public.crop_varieties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID REFERENCES public.market_prices(id),
  variety_name TEXT NOT NULL,
  quality_grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create weather_data table for weather information
CREATE TABLE IF NOT EXISTS public.weather_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL,
  temperature DECIMAL,
  humidity DECIMAL,
  rainfall DECIMAL,
  wind_speed DECIMAL,
  weather_condition TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated soil_analysis table to match API requirements
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

-- Updated disease_reports table to match API requirements
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

-- Enable Row Level Security
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encyclopedia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_varieties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for farmers table
CREATE POLICY "farmers_select_own" ON public.farmers FOR SELECT USING (true);
CREATE POLICY "farmers_insert_own" ON public.farmers FOR INSERT WITH CHECK (true);
CREATE POLICY "farmers_update_own" ON public.farmers FOR UPDATE USING (true);

-- Create RLS policies for public read tables
CREATE POLICY "encyclopedia_select_all" ON public.encyclopedia FOR SELECT USING (true);
CREATE POLICY "schemes_select_all" ON public.schemes FOR SELECT USING (true);
CREATE POLICY "market_prices_select_all" ON public.market_prices FOR SELECT USING (true);
CREATE POLICY "crop_varieties_select_all" ON public.crop_varieties FOR SELECT USING (true);
CREATE POLICY "weather_data_select_all" ON public.weather_data FOR SELECT USING (true);

-- Create RLS policies for user-specific data
CREATE POLICY "soil_analysis_select_own" ON public.soil_analysis FOR SELECT USING (true);
CREATE POLICY "soil_analysis_insert_own" ON public.soil_analysis FOR INSERT WITH CHECK (true);
CREATE POLICY "disease_reports_select_own" ON public.disease_reports FOR SELECT USING (true);
CREATE POLICY "disease_reports_insert_own" ON public.disease_reports FOR INSERT WITH CHECK (true);
