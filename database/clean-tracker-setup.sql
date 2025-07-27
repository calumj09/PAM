CREATE TABLE simple_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_subtype TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  amount_ml INTEGER,
  breast_side TEXT,
  food_items TEXT[],
  sleep_quality TEXT,
  wake_up_mood TEXT,
  sleep_location TEXT,
  diaper_consistency TEXT,
  diaper_color TEXT,
  rash_present BOOLEAN DEFAULT FALSE,
  weight_grams INTEGER,
  height_cm NUMERIC(5,2),
  head_circumference_cm NUMERIC(4,1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_simple_activities_child_date ON simple_activities(child_id, started_at DESC);

CREATE INDEX idx_simple_activities_type ON simple_activities(child_id, activity_type, started_at DESC);

ALTER TABLE simple_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their children's activities" ON simple_activities FOR SELECT USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert activities for their children" ON simple_activities FOR INSERT WITH CHECK (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their children's activities" ON simple_activities FOR UPDATE USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their children's activities" ON simple_activities FOR DELETE USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));