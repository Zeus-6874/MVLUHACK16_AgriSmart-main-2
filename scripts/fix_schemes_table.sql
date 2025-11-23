-- Quick fix: Update existing schemes table to support category_id
-- Run this if you already have a schemes table but it's missing category_id

-- First, create scheme_categories if it doesn't exist
CREATE TABLE IF NOT EXISTS scheme_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- Add category_id column to existing schemes table
ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS category_id uuid references scheme_categories(id) on delete set null;

-- Add other missing columns from new schema
ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS name_local text;
ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS subsidy_details text;
ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS official_url text;
ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS last_updated date default current_date;

-- Migrate scheme_name to name if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schemes' AND column_name = 'scheme_name') THEN
    -- Copy scheme_name to name where name is null
    UPDATE public.schemes SET name = scheme_name WHERE name IS NULL OR name = '';
    -- If all rows have name populated, we can optionally drop scheme_name later
  END IF;
END $$;

-- Create index for category_id
CREATE INDEX IF NOT EXISTS idx_schemes_category ON public.schemes(category_id);

-- Enable RLS if not already enabled
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;

-- Create RLS policy if it doesn't exist
DROP POLICY IF EXISTS "Allow public read access" ON public.schemes;
CREATE POLICY "Allow public read access" ON public.schemes FOR SELECT USING (true);

-- Verify the fix
DO $$
DECLARE
  has_category_id BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schemes' 
    AND column_name = 'category_id'
  ) INTO has_category_id;
  
  IF has_category_id THEN
    RAISE NOTICE '✅ Success! schemes table now has category_id column.';
  ELSE
    RAISE EXCEPTION '❌ Failed to add category_id column.';
  END IF;
END $$;

