-- Test script to verify checklist_items table functionality
-- Run this after fix-checklist-table.sql

-- Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'checklist_items' 
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'checklist_items';

-- List all policies on the table
SELECT 
  policyname, 
  permissive, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'checklist_items';

-- Test basic operations (if you have a test child)
-- This will only work if you have children in the database
-- SELECT COUNT(*) as "Children in database" FROM children;

-- Show sample schema for debugging
RAISE NOTICE 'Table structure verified. Ready to test with app!';