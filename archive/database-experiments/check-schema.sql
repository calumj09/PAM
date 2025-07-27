-- Check if all required columns exist for PAM onboarding
-- Run this in your Supabase SQL editor to verify schema

-- Check profiles table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check children table structure  
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'children' 
ORDER BY ordinal_position;

-- Check checklist_items table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'checklist_items' 
ORDER BY ordinal_position;

-- Check if extended baby profile columns exist
SELECT 
    CASE 
        WHEN COUNT(*) = 8 THEN 'All extended baby profile columns exist'
        ELSE 'Missing extended baby profile columns: ' || 
             STRING_AGG(missing_column, ', ')
    END as status
FROM (
    SELECT column_name as missing_column
    FROM (VALUES 
        ('is_due_date'),
        ('baby_type'), 
        ('gender'),
        ('birth_height_cm'),
        ('birth_weight_grams'),
        ('head_circumference_cm'),
        ('feeding_method'),
        ('birth_type')
    ) as required(column_name)
    WHERE required.column_name NOT IN (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'children'
    )
) missing;

-- Check if profiles table has extended columns
SELECT 
    CASE 
        WHEN COUNT(*) = 2 THEN 'All extended profile columns exist'
        ELSE 'Missing extended profile columns: ' || 
             STRING_AGG(missing_column, ', ')
    END as status
FROM (
    SELECT column_name as missing_column
    FROM (VALUES 
        ('updated_at'),
        ('onboarding_completed')
    ) as required(column_name)
    WHERE required.column_name NOT IN (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'profiles'
    )
) missing;