-- Delete user calum@cjadvisory.com.au from Supabase

-- First, find the user ID
SELECT id, email FROM auth.users WHERE email = 'calum@cjadvisory.com.au';

-- Delete from all related tables (adjust based on your schema)
-- Replace 'USER_ID_HERE' with the actual user ID from the query above

-- Delete from custom tables first (due to foreign key constraints)
DELETE FROM public.checklist_items WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.children WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.profiles WHERE id = 'USER_ID_HERE';

-- Finally, delete from auth.users
DELETE FROM auth.users WHERE email = 'calum@cjadvisory.com.au';

-- Verify deletion
SELECT * FROM auth.users WHERE email = 'calum@cjadvisory.com.au';