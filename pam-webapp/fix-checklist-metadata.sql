-- Fix checklist_items table by adding missing metadata column if it doesn't exist
ALTER TABLE checklist_items 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Also ensure user_id column exists (needed for the checklist generation)
ALTER TABLE checklist_items 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users;

-- Update any existing checklist items to have the user_id from their child record
UPDATE checklist_items ci
SET user_id = c.user_id
FROM children c
WHERE ci.child_id = c.id
AND ci.user_id IS NULL;