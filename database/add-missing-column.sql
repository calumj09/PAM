-- Add the missing completed_date column to checklist_items
ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS completed_date TIMESTAMPTZ;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'checklist_items' 
AND column_name = 'completed_date';

-- Success message
SELECT 'Added completed_date column to checklist_items' as status;