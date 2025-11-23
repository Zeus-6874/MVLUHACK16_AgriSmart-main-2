-- Update farmers table to reference auth.users
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create government_schemes table with proper structure
CREATE TABLE IF NOT EXISTS public.government_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  eligibility_criteria TEXT,
  benefits TEXT,
  application_process TEXT,
  deadline DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for government_schemes
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "government_schemes_select_all" ON public.government_schemes FOR SELECT USING (true);

-- Update market_prices table structure
ALTER TABLE public.market_prices ADD COLUMN IF NOT EXISTS market_location TEXT;
ALTER TABLE public.market_prices ADD COLUMN IF NOT EXISTS date_recorded DATE DEFAULT CURRENT_DATE;

-- Create crops table for better crop management
CREATE TABLE IF NOT EXISTS public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  variety TEXT,
  season TEXT,
  growth_duration INTEGER, -- in days
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for crops
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crops_select_all" ON public.crops FOR SELECT USING (true);

-- Update encyclopedia table structure
ALTER TABLE public.encyclopedia ADD COLUMN IF NOT EXISTS harvesting_time TEXT;
ALTER TABLE public.encyclopedia ADD COLUMN IF NOT EXISTS soil_requirements TEXT;
ALTER TABLE public.encyclopedia ADD COLUMN IF NOT EXISTS fertilizer_recommendations TEXT;
ALTER TABLE public.encyclopedia ADD COLUMN IF NOT EXISTS market_demand TEXT;
ALTER TABLE public.encyclopedia ADD CONSTRAINT encyclopedia_crop_name_unique UNIQUE (crop_name);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.farmers (user_id, name, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for better security
DROP POLICY IF EXISTS "farmers_select_own" ON public.farmers;
DROP POLICY IF EXISTS "farmers_insert_own" ON public.farmers;
DROP POLICY IF EXISTS "farmers_update_own" ON public.farmers;

CREATE POLICY "farmers_select_own" ON public.farmers FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "farmers_insert_own" ON public.farmers FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "farmers_update_own" ON public.farmers FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Update soil_analysis RLS policies
DROP POLICY IF EXISTS "soil_analysis_select_own" ON public.soil_analysis;
DROP POLICY IF EXISTS "soil_analysis_insert_own" ON public.soil_analysis;

CREATE POLICY "soil_analysis_select_own" ON public.soil_analysis FOR SELECT USING (
  farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
);
CREATE POLICY "soil_analysis_insert_own" ON public.soil_analysis FOR INSERT WITH CHECK (
  farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
);

-- Update disease_reports RLS policies
DROP POLICY IF EXISTS "disease_reports_select_own" ON public.disease_reports;
DROP POLICY IF EXISTS "disease_reports_insert_own" ON public.disease_reports;

CREATE POLICY "disease_reports_select_own" ON public.disease_reports FOR SELECT USING (
  farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
);
CREATE POLICY "disease_reports_insert_own" ON public.disease_reports FOR INSERT WITH CHECK (
  farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
);
