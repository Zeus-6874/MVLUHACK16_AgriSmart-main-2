-- Phase 1: Advanced Field Management System Database Schema
-- This migration adds tables for spatial farm management, crop cycles, and field activities

-- Fields table for spatial farm management
CREATE TABLE IF NOT EXISTS public.fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmers(id),
  field_name TEXT NOT NULL,
  area_hectares DECIMAL NOT NULL,
  coordinates JSONB, -- GPS boundary coordinates
  soil_type TEXT,
  irrigation_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crop cycles table for seasonal tracking
CREATE TABLE IF NOT EXISTS public.crop_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID REFERENCES public.fields(id),
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
CREATE TABLE IF NOT EXISTS public.field_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_cycle_id UUID REFERENCES public.crop_cycles(id),
  activity_type TEXT, -- planting, fertilizing, irrigation, harvesting
  activity_date DATE,
  materials_used JSONB,
  cost DECIMAL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_fields_farmer_id ON public.fields(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crop_cycles_field_id ON public.crop_cycles(field_id);
CREATE INDEX IF NOT EXISTS idx_crop_cycles_status ON public.crop_cycles(status);
CREATE INDEX IF NOT EXISTS idx_field_activities_crop_cycle_id ON public.field_activities(crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_field_activities_activity_date ON public.field_activities(activity_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for fields table
CREATE POLICY "farmers_own_fields" ON public.fields FOR ALL USING (farmer_id = auth.uid());

-- RLS policies for crop_cycles table
CREATE POLICY "farmers_own_crop_cycles" ON public.crop_cycles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.fields
    WHERE public.fields.id = public.crop_cycles.field_id
    AND public.fields.farmer_id = auth.uid()
  )
);

-- RLS policies for field_activities table
CREATE POLICY "farmers_own_field_activities" ON public.field_activities FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.crop_cycles
    JOIN public.fields ON public.fields.id = public.crop_cycles.field_id
    WHERE public.crop_cycles.id = public.field_activities.crop_cycle_id
    AND public.fields.farmer_id = auth.uid()
  )
);

-- Add created_at and updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON public.fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crop_cycles_updated_at BEFORE UPDATE ON public.crop_cycles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();