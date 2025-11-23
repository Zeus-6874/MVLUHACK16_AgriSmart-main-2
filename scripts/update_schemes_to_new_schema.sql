-- PostgreSQL script to update existing schemes table to new schema
-- This script safely migrates from old schema to new schema
-- Run this in Supabase SQL Editor

-- Step 1: Create scheme_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.scheme_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Step 2: Add new columns to existing schemes table (PostgreSQL syntax)
DO $$
BEGIN
  -- Add category_id column (foreign key to scheme_categories)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schemes' 
    AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.schemes 
    ADD COLUMN category_id uuid REFERENCES public.scheme_categories(id) ON DELETE SET NULL;
  END IF;

  -- Add name column (if it doesn't exist)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schemes' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.schemes ADD COLUMN name text;
  END IF;

  -- Add other new columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schemes' 
    AND column_name = 'name_local'
  ) THEN
    ALTER TABLE public.schemes ADD COLUMN name_local text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schemes' 
    AND column_name = 'department'
  ) THEN
    ALTER TABLE public.schemes ADD COLUMN department text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schemes' 
    AND column_name = 'subsidy_details'
  ) THEN
    ALTER TABLE public.schemes ADD COLUMN subsidy_details text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schemes' 
    AND column_name = 'official_url'
  ) THEN
    ALTER TABLE public.schemes ADD COLUMN official_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schemes' 
    AND column_name = 'last_updated'
  ) THEN
    ALTER TABLE public.schemes ADD COLUMN last_updated date DEFAULT current_date;
  END IF;
END $$;

-- Step 3: Migrate data from old columns to new columns and handle column rename
DO $$
BEGIN
  -- If scheme_name exists, we need to handle the migration properly
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schemes' 
    AND column_name = 'scheme_name'
  ) THEN
    -- First, copy scheme_name to name for all rows
    UPDATE public.schemes 
    SET name = scheme_name 
    WHERE name IS NULL OR name = '';
    
    -- Make sure name is NOT NULL (since scheme_name was NOT NULL)
    ALTER TABLE public.schemes ALTER COLUMN name SET NOT NULL;
    
    -- Now we can safely drop the old scheme_name column
    -- But first, check if there are any rows where name is still null
    IF EXISTS (SELECT 1 FROM public.schemes WHERE name IS NULL) THEN
      RAISE EXCEPTION 'Cannot drop scheme_name: some rows have NULL name';
    ELSE
      -- Drop the old column
      ALTER TABLE public.schemes DROP COLUMN IF EXISTS scheme_name;
      RAISE NOTICE '✅ Dropped old scheme_name column';
    END IF;
  END IF;
END $$;

  -- If category (text) exists, try to create category entries and link them
  -- Note: This is optional - you may want to manually create categories
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schemes' 
    AND column_name = 'category'
  ) THEN
    -- Create categories from existing category text values
    INSERT INTO public.scheme_categories (name)
    SELECT DISTINCT category 
    FROM public.schemes 
    WHERE category IS NOT NULL 
      AND category != ''
      AND NOT EXISTS (
        SELECT 1 FROM public.scheme_categories WHERE name = schemes.category
      )
    ON CONFLICT (name) DO NOTHING;

    -- Link schemes to categories
    UPDATE public.schemes s
    SET category_id = sc.id
    FROM public.scheme_categories sc
    WHERE s.category = sc.name
      AND s.category_id IS NULL;
  END IF;
END $$;

-- Step 4: Create indexes and unique constraint for upsert
CREATE INDEX IF NOT EXISTS idx_schemes_category ON public.schemes(category_id);
CREATE INDEX IF NOT EXISTS idx_schemes_state ON public.schemes(state);

-- Add unique constraint on (name, state) for upsert operations
-- This allows the seed script to use ON CONFLICT (name, state)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'schemes_name_state_unique'
  ) THEN
    ALTER TABLE public.schemes 
    ADD CONSTRAINT schemes_name_state_unique UNIQUE (name, state);
  END IF;
END $$;

-- Step 5: Enable RLS and create policies
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.schemes;
CREATE POLICY "Allow public read access" ON public.schemes 
  FOR SELECT 
  USING (true);

-- Step 6: Verify the migration
DO $$
DECLARE
  has_category_id boolean;
  column_count integer;
BEGIN
  -- Check if category_id exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schemes' 
    AND column_name = 'category_id'
  ) INTO has_category_id;

  -- Count total columns
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'schemes';

  IF has_category_id THEN
    RAISE NOTICE '✅ Success! schemes table updated.';
    RAISE NOTICE '   - category_id column: EXISTS';
    RAISE NOTICE '   - Total columns: %', column_count;
  ELSE
    RAISE EXCEPTION '❌ Migration failed: category_id column not found';
  END IF;
END $$;

-- Done! Your schemes table now supports the new schema.
-- You can now run: pnpm seed:schemes

