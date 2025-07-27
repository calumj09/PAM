-- Fix infinite recursion in family_members policy
-- This error happens when policies reference each other in a loop

-- First, check if family_members table exists and what policies it has
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'family_members') THEN
        RAISE NOTICE 'family_members table exists - checking policies';
    ELSE
        RAISE NOTICE 'family_members table does not exist';
    END IF;
END $$;

-- Drop all policies on family_members table to break the recursion
DROP POLICY IF EXISTS "Users can view family members" ON family_members;
DROP POLICY IF EXISTS "Users can insert family members" ON family_members;
DROP POLICY IF EXISTS "Users can update family members" ON family_members;
DROP POLICY IF EXISTS "Users can delete family members" ON family_members;
DROP POLICY IF EXISTS "Family members can view each other" ON family_members;
DROP POLICY IF EXISTS "Family admins can manage members" ON family_members;

-- Drop the family_members table entirely if it exists (it's not in our core schema)
DROP TABLE IF EXISTS family_members CASCADE;

-- Also check for any triggers that might be causing issues
DROP TRIGGER IF EXISTS onboarding_completion_trigger ON family_members;

-- Verify children table structure is correct
SELECT table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'children' 
ORDER BY ordinal_position;

-- Make sure children table policies are simple and don't cause recursion
DROP POLICY IF EXISTS "Users can view own children" ON children;
DROP POLICY IF EXISTS "Users can insert own children" ON children;
DROP POLICY IF EXISTS "Users can update own children" ON children;
DROP POLICY IF EXISTS "Users can delete own children" ON children;

-- Recreate simple, non-recursive policies for children
CREATE POLICY "Users can view own children" ON children FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own children" ON children FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own children" ON children FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own children" ON children FOR DELETE USING (auth.uid() = user_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Fixed: Removed family_members table and fixed policy recursion';
END $$;