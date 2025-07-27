-- Emergency cleanup for infinite recursion in family_members
-- This will completely remove the problematic table and policies

-- Drop all policies on family_members table
DROP POLICY IF EXISTS "Users can view family members" ON family_members;
DROP POLICY IF EXISTS "Users can insert family members" ON family_members;
DROP POLICY IF EXISTS "Users can update family members" ON family_members;
DROP POLICY IF EXISTS "Users can delete family members" ON family_members;
DROP POLICY IF EXISTS "Family members can view each other" ON family_members;
DROP POLICY IF EXISTS "Family admins can manage members" ON family_members;
DROP POLICY IF EXISTS "Users can view family memberships" ON family_members;
DROP POLICY IF EXISTS "Family creators can manage families" ON family_members;
DROP POLICY IF EXISTS "Family members can view family" ON family_members;

-- Drop any triggers on family_members
DROP TRIGGER IF EXISTS family_members_trigger ON family_members;
DROP TRIGGER IF EXISTS family_membership_trigger ON family_members;

-- Drop the family_members table completely
DROP TABLE IF EXISTS family_members CASCADE;

-- Also drop families table if it exists (it's not needed for basic functionality)
DROP TABLE IF EXISTS families CASCADE;

-- Verify children table policies are simple and don't reference family tables
DROP POLICY IF EXISTS "Users can view own children" ON children;
DROP POLICY IF EXISTS "Users can insert own children" ON children;
DROP POLICY IF EXISTS "Users can update own children" ON children;
DROP POLICY IF EXISTS "Users can delete own children" ON children;
DROP POLICY IF EXISTS "Users can manage own children" ON children;

-- Recreate simple, non-recursive children policies
CREATE POLICY "Users can view own children" ON children FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own children" ON children FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own children" ON children FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own children" ON children FOR DELETE USING (auth.uid() = user_id);

-- Check for any other tables that might be causing recursion
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename LIKE '%family%' OR qual LIKE '%family%';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Cleanup complete: Removed family_members table and all recursive policies';
END $$;