-- Quick fix: Handle scheme_name to name migration
-- Run this if you're getting "null value in column scheme_name" error

DO $$
BEGIN
  -- Step 1: Ensure name column exists and has data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schemes' 
    AND column_name = 'scheme_name'
  ) THEN
    -- Copy scheme_name to name for all existing rows
    UPDATE public.schemes 
    SET name = scheme_name 
    WHERE (name IS NULL OR name = '') AND scheme_name IS NOT NULL;
    
    RAISE NOTICE '✅ Copied data from scheme_name to name';
    
    -- Make name NOT NULL if it's not already
    BEGIN
      ALTER TABLE public.schemes ALTER COLUMN name SET NOT NULL;
      RAISE NOTICE '✅ Set name column to NOT NULL';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'ℹ️  name column constraint already set or has NULL values';
    END;
    
    -- Drop the old scheme_name column
    BEGIN
      ALTER TABLE public.schemes DROP COLUMN scheme_name;
      RAISE NOTICE '✅ Dropped old scheme_name column';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '⚠️  Could not drop scheme_name: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'ℹ️  scheme_name column does not exist (already migrated)';
  END IF;
  
  -- Step 2: Ensure name column is NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schemes' 
    AND column_name = 'name'
  ) THEN
    -- Check if there are any NULL values
    IF EXISTS (SELECT 1 FROM public.schemes WHERE name IS NULL) THEN
      RAISE WARNING '⚠️  Found NULL values in name column. Setting default values...';
      UPDATE public.schemes SET name = 'Unnamed Scheme' WHERE name IS NULL;
    END IF;
    
    -- Set NOT NULL constraint
    BEGIN
      ALTER TABLE public.schemes ALTER COLUMN name SET NOT NULL;
      RAISE NOTICE '✅ name column is now NOT NULL';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'ℹ️  name column constraint: %', SQLERRM;
    END;
  END IF;
  
  -- Step 3: Verify the fix
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schemes' 
    AND column_name = 'scheme_name'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schemes' 
    AND column_name = 'name'
  ) THEN
    RAISE NOTICE '✅ Migration complete! schemes table now uses name column.';
  END IF;
END $$;

-- Verify current columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'schemes'
  AND column_name IN ('name', 'scheme_name')
ORDER BY column_name;

-- Done! Now you can run: pnpm seed:schemes

