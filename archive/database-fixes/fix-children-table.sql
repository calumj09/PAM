-- Fix for missing is_premium_feature column
-- Run this in Supabase SQL Editor

-- Add the missing is_premium_feature column
ALTER TABLE children ADD COLUMN IF NOT EXISTS is_premium_feature BOOLEAN DEFAULT FALSE;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'children' 
AND column_name = 'is_premium_feature';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Fixed: is_premium_feature column added to children table';
END $$;