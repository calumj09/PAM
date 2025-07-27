-- Quick fix - just drop the problematic table
-- Should take seconds, not minutes

DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS families CASCADE;

-- Simple success check
SELECT 'Cleanup complete' as status;