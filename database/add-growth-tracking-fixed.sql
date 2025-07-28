-- Add Growth Tracking Tables and Migrate Birth Data (Fixed Version)
-- This handles existing tables and UUID issues

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS growth_alerts CASCADE;
DROP TABLE IF EXISTS growth_measurements CASCADE;
DROP TABLE IF EXISTS growth_reference_data CASCADE;

-- Growth measurements (height, weight, head circumference)
CREATE TABLE growth_measurements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  
  -- Measurement details
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  age_weeks INTEGER NOT NULL, -- Age in weeks at measurement
  
  -- Core measurements (in metric - Australian standard)
  height_cm DECIMAL(5,2), -- Height in centimeters
  weight_kg DECIMAL(5,3), -- Weight in kilograms (to 3 decimal places for accuracy)
  head_circumference_cm DECIMAL(5,2), -- Head circumference in centimeters
  
  -- Calculated percentiles (based on WHO/Australian growth charts)
  height_percentile DECIMAL(5,2), -- 0.00 to 100.00
  weight_percentile DECIMAL(5,2),
  head_circumference_percentile DECIMAL(5,2),
  weight_for_height_percentile DECIMAL(5,2), -- Weight-for-height ratio
  
  -- Measurement context (TEXT fields to avoid UUID issues)
  measured_by TEXT DEFAULT 'parent',
  measurement_location TEXT DEFAULT 'home', -- 'home', 'gp', 'hospital', 'childcare', 'at_birth'
  notes TEXT,
  
  -- Data quality
  is_estimated BOOLEAN DEFAULT false, -- If measurement was estimated vs precise
  measurement_method TEXT, -- 'digital_scale', 'tape_measure', 'growth_chart', etc.
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Growth alerts and recommendations
CREATE TABLE growth_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  
  -- Alert details
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_percentile', 'high_percentile', 'rapid_change', 'no_growth', 'milestone_delay')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'low', 'medium', 'high', 'urgent')),
  
  -- Alert specifics
  measurement_type TEXT, -- 'height', 'weight', 'head_circumference'
  current_percentile DECIMAL(5,2),
  previous_percentile DECIMAL(5,2),
  percentile_change DECIMAL(5,2),
  
  -- Message content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  recommendation TEXT,
  
  -- Australian healthcare guidance
  gp_consultation_recommended BOOLEAN DEFAULT false,
  urgent_medical_attention BOOLEAN DEFAULT false,
  
  -- Status tracking
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  
  -- Reference data
  triggered_by_measurement_id UUID REFERENCES growth_measurements(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Australian/WHO growth reference data (percentile curves)
CREATE TABLE growth_reference_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Child demographics
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  age_weeks INTEGER NOT NULL,
  
  -- Reference measurement type
  measurement_type TEXT NOT NULL CHECK (measurement_type IN ('height', 'weight', 'head_circumference', 'weight_for_height')),
  
  -- WHO/Australian standard percentiles
  p3 DECIMAL(6,3),   -- 3rd percentile
  p5 DECIMAL(6,3),   -- 5th percentile
  p10 DECIMAL(6,3),  -- 10th percentile
  p25 DECIMAL(6,3),  -- 25th percentile
  p50 DECIMAL(6,3),  -- 50th percentile (median)
  p75 DECIMAL(6,3),  -- 75th percentile
  p90 DECIMAL(6,3),  -- 90th percentile
  p95 DECIMAL(6,3),  -- 95th percentile
  p97 DECIMAL(6,3),  -- 97th percentile
  
  -- Data source
  source TEXT DEFAULT 'WHO_2006', -- WHO Child Growth Standards 2006
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(sex, age_weeks, measurement_type)
);

-- Create indexes for performance
CREATE INDEX idx_growth_measurements_child_date ON growth_measurements(child_id, measurement_date DESC);
CREATE INDEX idx_growth_measurements_child_age ON growth_measurements(child_id, age_weeks);
CREATE INDEX idx_growth_alerts_child ON growth_alerts(child_id, created_at DESC);
CREATE INDEX idx_growth_reference_lookup ON growth_reference_data(sex, measurement_type, age_weeks);

-- Row Level Security
ALTER TABLE growth_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_alerts ENABLE ROW LEVEL SECURITY;

-- Growth Measurements RLS - Simplified without family sharing
CREATE POLICY "Users can view measurements for their children" ON growth_measurements
  FOR SELECT USING (
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can add measurements for their children" ON growth_measurements
  FOR INSERT WITH CHECK (
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update measurements for their children" ON growth_measurements
  FOR UPDATE USING (
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete measurements for their children" ON growth_measurements
  FOR DELETE USING (
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid())
  );

-- Growth Alerts RLS
CREATE POLICY "Users can view alerts for their children" ON growth_alerts
  FOR SELECT USING (
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can acknowledge alerts for their children" ON growth_alerts
  FOR UPDATE USING (
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid())
  );

-- Insert sample WHO reference data for testing (just a few key ages)
-- In production, you'd import the full WHO growth charts
INSERT INTO growth_reference_data (sex, age_weeks, measurement_type, p3, p5, p10, p25, p50, p75, p90, p95, p97) VALUES
-- Birth measurements (0 weeks) - boys weight (in kg)
('male', 0, 'weight', 2.5, 2.6, 2.8, 3.0, 3.3, 3.6, 3.9, 4.1, 4.3),
-- Birth measurements (0 weeks) - girls weight (in kg)
('female', 0, 'weight', 2.4, 2.5, 2.7, 2.9, 3.2, 3.5, 3.8, 4.0, 4.2),
-- Birth measurements (0 weeks) - boys height (in cm)
('male', 0, 'height', 46.1, 47.0, 48.0, 49.2, 50.5, 51.8, 53.0, 53.8, 54.4),
-- Birth measurements (0 weeks) - girls height (in cm)
('female', 0, 'height', 45.4, 46.3, 47.3, 48.5, 49.8, 51.1, 52.3, 53.1, 53.7);

-- Function to migrate birth measurements from children table to growth_measurements
CREATE OR REPLACE FUNCTION migrate_birth_measurements()
RETURNS INTEGER AS $$
DECLARE
  child_record RECORD;
  migrated_count INTEGER := 0;
  age_weeks INTEGER;
BEGIN
  -- Loop through all children who have birth measurements but no growth measurements
  FOR child_record IN 
    SELECT 
      c.id,
      c.date_of_birth,
      c.birth_height_cm,
      c.birth_weight_grams,
      c.head_circumference_cm,
      c.created_at
    FROM children c
    LEFT JOIN growth_measurements gm ON c.id = gm.child_id
    WHERE gm.id IS NULL -- No existing growth measurements
      AND (c.birth_height_cm IS NOT NULL OR c.birth_weight_grams IS NOT NULL OR c.head_circumference_cm IS NOT NULL)
  LOOP
    -- Calculate age in weeks (should be 0 for birth measurements)
    age_weeks := 0;
    
    -- Insert birth measurement
    INSERT INTO growth_measurements (
      child_id,
      measurement_date,
      age_weeks,
      height_cm,
      weight_kg,
      head_circumference_cm,
      measured_by,
      measurement_location,
      notes,
      is_estimated,
      created_at
    ) VALUES (
      child_record.id,
      child_record.date_of_birth,
      age_weeks,
      child_record.birth_height_cm,
      CASE 
        WHEN child_record.birth_weight_grams IS NOT NULL 
        THEN child_record.birth_weight_grams / 1000.0 -- Convert grams to kg
        ELSE NULL 
      END,
      child_record.head_circumference_cm,
      'Healthcare Provider',
      'at_birth',
      'Birth measurements recorded during hospital/birth centre visit',
      false,
      child_record.created_at
    );
    
    migrated_count := migrated_count + 1;
  END LOOP;
  
  RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- Run the migration
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT migrate_birth_measurements() INTO migrated_count;
  RAISE NOTICE 'Migrated % birth measurements to growth tracker', migrated_count;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🎉 Growth tracking setup complete!';
  RAISE NOTICE '✅ Growth measurement tables created';
  RAISE NOTICE '✅ Birth measurements migrated from children table';
  RAISE NOTICE '✅ Added "At Birth" as measurement location option';
  RAISE NOTICE '✅ Sample WHO reference data inserted';
  RAISE NOTICE '✅ Row level security policies configured';
  RAISE NOTICE '📊 Growth tracker should now show birth measurements for existing children';
END $$;