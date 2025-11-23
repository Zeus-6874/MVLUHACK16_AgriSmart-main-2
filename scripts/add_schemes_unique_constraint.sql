-- Quick fix: Add unique constraint for upsert operations
-- Run this in Supabase SQL Editor if you're getting "no unique constraint" error

-- Add unique constraint on (name, state) for upsert operations
-- This allows the seed script to use ON CONFLICT (name, state)
DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'schemes_name_state_unique'
      AND conrelid = 'public.schemes'::regclass
  ) THEN
    -- Add the unique constraint
    ALTER TABLE public.schemes 
    ADD CONSTRAINT schemes_name_state_unique UNIQUE (name, state);
    
    RAISE NOTICE '✅ Added unique constraint on (name, state)';
  ELSE
    RAISE NOTICE 'ℹ️  Unique constraint already exists';
  END IF;
END $$;

-- Verify the constraint was created
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'public.schemes'::regclass
  AND conname = 'schemes_name_state_unique';

-- Done! Now you can run: pnpm seed:schemes

