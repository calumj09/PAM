-- Simple activities table that combines all activity data
CREATE TABLE IF NOT EXISTS simple_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'feeding', 'sleep', 'nappy', 'diaper', 'growth', 'note'
  activity_subtype TEXT, -- 'breast', 'bottle', 'solid' for feeding; 'wet', 'dirty' for nappy/diaper
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Feeding specific fields
  amount_ml INTEGER,
  breast_side TEXT, -- 'left', 'right', 'both'
  food_items TEXT[], -- for solid foods
  
  -- Sleep specific fields
  sleep_quality TEXT, -- 'excellent', 'good', 'fair', 'poor'
  wake_up_mood TEXT, -- 'happy', 'cranky', 'calm'
  sleep_location TEXT, -- 'crib', 'bed', 'stroller', 'car'
  
  -- Nappy/Diaper specific fields
  diaper_consistency TEXT, -- 'liquid', 'soft', 'normal', 'hard'
  diaper_color TEXT,
  rash_present BOOLEAN DEFAULT FALSE,
  
  -- Growth specific fields
  weight_grams INTEGER,
  height_cm NUMERIC(5,2),
  head_circumference_cm NUMERIC(4,1),
  
  -- General fields
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_simple_activities_child_date 
ON simple_activities(child_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_simple_activities_type 
ON simple_activities(child_id, activity_type, started_at DESC);

-- Enable RLS
ALTER TABLE simple_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their children's activities" 
ON simple_activities FOR SELECT 
USING (
  child_id IN (
    SELECT id FROM children WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert activities for their children" 
ON simple_activities FOR INSERT 
WITH CHECK (
  child_id IN (
    SELECT id FROM children WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their children's activities" 
ON simple_activities FOR UPDATE 
USING (
  child_id IN (
    SELECT id FROM children WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their children's activities" 
ON simple_activities FOR DELETE 
USING (
  child_id IN (
    SELECT id FROM children WHERE user_id = auth.uid()
  )
);