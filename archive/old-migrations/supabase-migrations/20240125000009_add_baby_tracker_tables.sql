-- Baby Tracker Database Schema
-- This migration adds all the necessary tables for comprehensive baby tracking

-- Activity types and categories
CREATE TABLE IF NOT EXISTS activity_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('feeding', 'sleep', 'diaper', 'milestone', 'health', 'other')),
  icon TEXT,
  color TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default activity types if they don't exist
INSERT INTO activity_types (name, category, icon, color, is_default) VALUES
-- Feeding activities
('Breastfeeding', 'feeding', '🤱', '#10B981', true),
('Bottle Feeding', 'feeding', '🍼', '#10B981', true),
('Solid Food', 'feeding', '🥄', '#10B981', true),
('Snack', 'feeding', '🍎', '#10B981', true),

-- Sleep activities  
('Night Sleep', 'sleep', '😴', '#6366F1', true),
('Nap', 'sleep', '💤', '#6366F1', true),
('Bedtime Routine', 'sleep', '🌙', '#6366F1', true),

-- Diaper activities
('Wet Diaper', 'diaper', '💧', '#F59E0B', true),
('Dirty Diaper', 'diaper', '💩', '#F59E0B', true),
('Clean Diaper', 'diaper', '✨', '#F59E0B', true),

-- Milestone activities
('First Smile', 'milestone', '😊', '#EC4899', true),
('Rolling Over', 'milestone', '🔄', '#EC4899', true),
('Sitting Up', 'milestone', '🪑', '#EC4899', true),
('Crawling', 'milestone', '🐛', '#EC4899', true),
('First Words', 'milestone', '💬', '#EC4899', true),
('Walking', 'milestone', '🚶', '#EC4899', true),

-- Health activities
('Temperature', 'health', '🌡️', '#EF4444', true),
('Medicine', 'health', '💊', '#EF4444', true),
('Doctor Visit', 'health', '👩‍⚕️', '#EF4444', true),

-- Other activities
('Tummy Time', 'other', '🤸', '#8B5CF6', true),
('Bath Time', 'other', '🛁', '#8B5CF6', true),
('Play Time', 'other', '🧸', '#8B5CF6', true)
ON CONFLICT (name) DO NOTHING;

-- Main activity tracking table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children NOT NULL,
  activity_type_id UUID REFERENCES activity_types NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER, -- Calculated field for convenience
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feeding-specific data structure
CREATE TABLE IF NOT EXISTS feeding_details (
  activity_id UUID REFERENCES activities PRIMARY KEY,
  feeding_type TEXT CHECK (feeding_type IN ('breast', 'bottle', 'solid')),
  amount_ml INTEGER, -- For bottle feeding
  breast_side TEXT CHECK (breast_side IN ('left', 'right', 'both')), -- For breastfeeding
  food_items TEXT[], -- For solid foods
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sleep-specific data structure  
CREATE TABLE IF NOT EXISTS sleep_details (
  activity_id UUID REFERENCES activities PRIMARY KEY,
  sleep_quality TEXT CHECK (sleep_quality IN ('excellent', 'good', 'fair', 'poor')),
  wake_up_mood TEXT CHECK (wake_up_mood IN ('happy', 'cranky', 'neutral', 'sleepy')),
  sleep_location TEXT, -- crib, bassinet, parent bed, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diaper-specific data structure
CREATE TABLE IF NOT EXISTS diaper_details (
  activity_id UUID REFERENCES activities PRIMARY KEY,
  diaper_type TEXT CHECK (diaper_type IN ('wet', 'dirty', 'mixed', 'clean')),
  consistency TEXT CHECK (consistency IN ('liquid', 'soft', 'normal', 'hard')), -- For dirty diapers
  color TEXT, -- For tracking health
  rash_present BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health-specific data structure
CREATE TABLE IF NOT EXISTS health_details (
  activity_id UUID REFERENCES activities PRIMARY KEY,
  temperature_celsius DECIMAL(4,1), -- e.g., 36.5
  medication_name TEXT,
  medication_dose TEXT,
  symptoms TEXT[],
  healthcare_provider TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Growth tracking
CREATE TABLE IF NOT EXISTS growth_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL,
  weight_grams INTEGER,
  height_cm DECIMAL(5,2),
  head_circumference_cm DECIMAL(5,2),
  notes TEXT,
  recorded_by TEXT, -- healthcare provider or parent
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_child_started_at ON activities(child_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type_started_at ON activities(activity_type_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_child_type ON activities(child_id, activity_type_id);
CREATE INDEX IF NOT EXISTS idx_growth_records_child_recorded ON growth_records(child_id, recorded_at DESC);

-- Enable Row Level Security
ALTER TABLE activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeding_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaper_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_types (read-only for all authenticated users)
DROP POLICY IF EXISTS "Activity types are viewable by authenticated users" ON activity_types;
CREATE POLICY "Activity types are viewable by authenticated users" ON activity_types FOR SELECT TO authenticated USING (true);

-- RLS Policies for activities
DROP POLICY IF EXISTS "Users can view activities for their children" ON activities;
CREATE POLICY "Users can view activities for their children" ON activities FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM children WHERE children.id = activities.child_id AND children.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert activities for their children" ON activities;
CREATE POLICY "Users can insert activities for their children" ON activities FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM children WHERE children.id = activities.child_id AND children.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update activities for their children" ON activities;
CREATE POLICY "Users can update activities for their children" ON activities FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM children WHERE children.id = activities.child_id AND children.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete activities for their children" ON activities;
CREATE POLICY "Users can delete activities for their children" ON activities FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM children WHERE children.id = activities.child_id AND children.user_id = auth.uid()
  )
);

-- RLS Policies for detail tables
DROP POLICY IF EXISTS "Users can view feeding details for their children" ON feeding_details;
CREATE POLICY "Users can view feeding details for their children" ON feeding_details FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM activities 
    JOIN children ON children.id = activities.child_id 
    WHERE activities.id = feeding_details.activity_id AND children.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert feeding details for their children" ON feeding_details;
CREATE POLICY "Users can insert feeding details for their children" ON feeding_details FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM activities 
    JOIN children ON children.id = activities.child_id 
    WHERE activities.id = feeding_details.activity_id AND children.user_id = auth.uid()
  )
);

-- Similar policies for other detail tables
DROP POLICY IF EXISTS "Users can view sleep details for their children" ON sleep_details;
CREATE POLICY "Users can view sleep details for their children" ON sleep_details FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM activities 
    JOIN children ON children.id = activities.child_id 
    WHERE activities.id = sleep_details.activity_id AND children.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert sleep details for their children" ON sleep_details;
CREATE POLICY "Users can insert sleep details for their children" ON sleep_details FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM activities 
    JOIN children ON children.id = activities.child_id 
    WHERE activities.id = sleep_details.activity_id AND children.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can view diaper details for their children" ON diaper_details;
CREATE POLICY "Users can view diaper details for their children" ON diaper_details FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM activities 
    JOIN children ON children.id = activities.child_id 
    WHERE activities.id = diaper_details.activity_id AND children.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert diaper details for their children" ON diaper_details;
CREATE POLICY "Users can insert diaper details for their children" ON diaper_details FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM activities 
    JOIN children ON children.id = activities.child_id 
    WHERE activities.id = diaper_details.activity_id AND children.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can view health details for their children" ON health_details;
CREATE POLICY "Users can view health details for their children" ON health_details FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM activities 
    JOIN children ON children.id = activities.child_id 
    WHERE activities.id = health_details.activity_id AND children.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert health details for their children" ON health_details;
CREATE POLICY "Users can insert health details for their children" ON health_details FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM activities 
    JOIN children ON children.id = activities.child_id 
    WHERE activities.id = health_details.activity_id AND children.user_id = auth.uid()
  )
);

-- RLS Policies for growth records
DROP POLICY IF EXISTS "Users can view growth records for their children" ON growth_records;
CREATE POLICY "Users can view growth records for their children" ON growth_records FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM children WHERE children.id = growth_records.child_id AND children.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert growth records for their children" ON growth_records;
CREATE POLICY "Users can insert growth records for their children" ON growth_records FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM children WHERE children.id = growth_records.child_id AND children.user_id = auth.uid()
  )
);

-- Function to calculate activity duration
CREATE OR REPLACE FUNCTION calculate_activity_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate duration
DROP TRIGGER IF EXISTS calculate_duration_trigger ON activities;
CREATE TRIGGER calculate_duration_trigger
  BEFORE INSERT OR UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION calculate_activity_duration();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamps
DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();