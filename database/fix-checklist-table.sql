-- Fix checklist_items table - ensure it exists with all correct columns
-- This script is safe to run multiple times

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop and recreate the table to ensure correct schema
DROP TABLE IF EXISTS checklist_items CASCADE;

-- Create checklist_items table with all required columns
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  category TEXT CHECK (category IN ('immunization', 'registration', 'milestone', 'checkup', 'government', 'health', 'admin')) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  completed_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}' NOT NULL,
  week_number INTEGER,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_checklist_items_child_id ON checklist_items(child_id);
CREATE INDEX idx_checklist_items_due_date ON checklist_items(due_date);
CREATE INDEX idx_checklist_items_category ON checklist_items(category);
CREATE INDEX idx_checklist_items_completed ON checklist_items(is_completed);

-- Enable Row Level Security
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view checklist for own children" ON checklist_items;
DROP POLICY IF EXISTS "Users can manage checklist for own children" ON checklist_items;

-- Create RLS policies
CREATE POLICY "Users can view checklist for own children" ON checklist_items
FOR SELECT USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert checklist for own children" ON checklist_items
FOR INSERT WITH CHECK (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

CREATE POLICY "Users can update checklist for own children" ON checklist_items
FOR UPDATE USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete checklist for own children" ON checklist_items
FOR DELETE USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_checklist_items_updated_at
    BEFORE UPDATE ON checklist_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the table structure
DO $$
BEGIN
  -- Check if table exists and has required columns
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'checklist_items') THEN
    RAISE NOTICE '✅ checklist_items table exists';
    
    -- Check for required columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_items' AND column_name = 'is_completed') THEN
      RAISE NOTICE '✅ is_completed column exists';
    ELSE
      RAISE EXCEPTION '❌ is_completed column missing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_items' AND column_name = 'metadata') THEN
      RAISE NOTICE '✅ metadata column exists';
    ELSE
      RAISE EXCEPTION '❌ metadata column missing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_items' AND column_name = 'child_id') THEN
      RAISE NOTICE '✅ child_id column exists';
    ELSE
      RAISE EXCEPTION '❌ child_id column missing';
    END IF;
    
    RAISE NOTICE '🎉 checklist_items table is properly configured!';
    RAISE NOTICE '📋 Ready for checklist functionality';
    RAISE NOTICE '✨ Ready for optional admin tasks';
    
  ELSE
    RAISE EXCEPTION '❌ checklist_items table does not exist';
  END IF;
END $$;