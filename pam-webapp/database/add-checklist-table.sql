-- Add missing checklist_items table for timeline functionality

-- Create checklist_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  category TEXT CHECK (category IN ('immunization', 'registration', 'milestone', 'checkup', 'government', 'health', 'admin')) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  week_number INTEGER,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "Users can manage checklist for own children" ON checklist_items
FOR ALL USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_checklist_items_child_id ON checklist_items(child_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_due_date ON checklist_items(due_date);
CREATE INDEX IF NOT EXISTS idx_checklist_items_category ON checklist_items(category);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Checklist table added successfully! Timeline functionality should now work.';
END $$;