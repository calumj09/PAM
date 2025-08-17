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

-- Insert WHO reference data from birth to 52 weeks (1 year)
-- Based on WHO Child Growth Standards 2006
INSERT INTO growth_reference_data (sex, age_weeks, measurement_type, p3, p5, p10, p25, p50, p75, p90, p95, p97) VALUES
-- MALE WEIGHT (kg)
('male', 0, 'weight', 2.5, 2.6, 2.8, 3.0, 3.3, 3.6, 3.9, 4.1, 4.3),
('male', 4, 'weight', 3.4, 3.6, 3.8, 4.2, 4.6, 5.1, 5.6, 5.9, 6.2),
('male', 8, 'weight', 4.2, 4.4, 4.7, 5.1, 5.7, 6.3, 7.0, 7.4, 7.8),
('male', 12, 'weight', 4.8, 5.1, 5.4, 5.9, 6.6, 7.3, 8.1, 8.6, 9.1),
('male', 16, 'weight', 5.3, 5.6, 5.9, 6.5, 7.3, 8.1, 9.0, 9.6, 10.2),
('male', 20, 'weight', 5.7, 6.0, 6.4, 7.0, 7.9, 8.8, 9.8, 10.5, 11.1),
('male', 24, 'weight', 6.0, 6.4, 6.8, 7.5, 8.4, 9.4, 10.5, 11.2, 11.9),
('male', 32, 'weight', 6.6, 7.0, 7.5, 8.3, 9.3, 10.4, 11.7, 12.5, 13.3),
('male', 40, 'weight', 7.1, 7.6, 8.1, 8.9, 10.0, 11.3, 12.7, 13.6, 14.5),
('male', 48, 'weight', 7.6, 8.1, 8.6, 9.5, 10.7, 12.1, 13.6, 14.6, 15.6),
('male', 52, 'weight', 7.8, 8.3, 8.9, 9.8, 11.0, 12.4, 14.0, 15.0, 16.0),

-- FEMALE WEIGHT (kg)
('female', 0, 'weight', 2.4, 2.5, 2.7, 2.9, 3.2, 3.5, 3.8, 4.0, 4.2),
('female', 4, 'weight', 3.2, 3.4, 3.6, 4.0, 4.4, 4.9, 5.4, 5.7, 6.0),
('female', 8, 'weight', 3.9, 4.1, 4.4, 4.8, 5.4, 6.0, 6.7, 7.1, 7.5),
('female', 12, 'weight', 4.5, 4.7, 5.0, 5.5, 6.2, 6.9, 7.7, 8.2, 8.7),
('female', 16, 'weight', 4.9, 5.2, 5.5, 6.1, 6.8, 7.6, 8.5, 9.1, 9.6),
('female', 20, 'weight', 5.3, 5.6, 6.0, 6.6, 7.4, 8.3, 9.3, 9.9, 10.5),
('female', 24, 'weight', 5.6, 5.9, 6.3, 7.0, 7.9, 8.8, 9.9, 10.6, 11.3),
('female', 32, 'weight', 6.2, 6.6, 7.0, 7.8, 8.7, 9.8, 11.0, 11.8, 12.6),
('female', 40, 'weight', 6.7, 7.1, 7.6, 8.4, 9.4, 10.6, 11.9, 12.8, 13.7),
('female', 48, 'weight', 7.1, 7.6, 8.1, 8.9, 10.1, 11.3, 12.8, 13.7, 14.7),
('female', 52, 'weight', 7.4, 7.9, 8.4, 9.2, 10.4, 11.7, 13.2, 14.2, 15.2),

-- MALE HEIGHT (cm)
('male', 0, 'height', 46.1, 47.0, 48.0, 49.2, 50.5, 51.8, 53.0, 53.8, 54.4),
('male', 4, 'height', 50.8, 51.8, 52.9, 54.4, 55.9, 57.4, 58.8, 59.6, 60.3),
('male', 8, 'height', 54.7, 55.8, 57.0, 58.6, 60.3, 61.9, 63.4, 64.3, 65.1),
('male', 12, 'height', 57.6, 58.8, 60.1, 61.8, 63.6, 65.4, 67.0, 68.0, 68.9),
('male', 16, 'height', 60.0, 61.2, 62.6, 64.4, 66.3, 68.2, 69.9, 71.0, 72.0),
('male', 20, 'height', 62.0, 63.3, 64.8, 66.7, 68.7, 70.7, 72.6, 73.7, 74.7),
('male', 24, 'height', 63.8, 65.1, 66.7, 68.7, 70.8, 72.9, 74.8, 76.0, 77.1),
('male', 32, 'height', 66.9, 68.4, 70.1, 72.3, 74.5, 76.8, 78.9, 80.2, 81.3),
('male', 40, 'height', 69.6, 71.2, 73.0, 75.3, 77.7, 80.1, 82.4, 83.8, 85.0),
('male', 48, 'height', 72.0, 73.7, 75.6, 78.0, 80.5, 83.0, 85.4, 86.9, 88.2),
('male', 52, 'height', 73.4, 75.2, 77.1, 79.6, 82.2, 84.8, 87.3, 88.8, 90.2),

-- FEMALE HEIGHT (cm)
('female', 0, 'height', 45.4, 46.3, 47.3, 48.5, 49.8, 51.1, 52.3, 53.1, 53.7),
('female', 4, 'height', 49.8, 50.8, 51.9, 53.2, 54.7, 56.2, 57.6, 58.4, 59.1),
('female', 8, 'height', 53.5, 54.6, 55.8, 57.3, 58.9, 60.6, 62.1, 62.9, 63.6),
('female', 12, 'height', 56.3, 57.4, 58.7, 60.3, 62.1, 63.8, 65.4, 66.3, 67.1),
('female', 16, 'height', 58.6, 59.8, 61.2, 62.9, 64.8, 66.6, 68.3, 69.2, 70.1),
('female', 20, 'height', 60.6, 61.9, 63.3, 65.1, 67.0, 69.0, 70.7, 71.7, 72.6),
('female', 24, 'height', 62.4, 63.7, 65.2, 67.1, 69.1, 71.1, 72.9, 73.9, 74.9),
('female', 32, 'height', 65.3, 66.8, 68.4, 70.5, 72.6, 74.8, 76.8, 77.9, 79.0),
('female', 40, 'height', 67.9, 69.4, 71.1, 73.3, 75.6, 77.9, 80.0, 81.2, 82.3),
('female', 48, 'height', 70.2, 71.8, 73.6, 75.9, 78.3, 80.7, 82.9, 84.2, 85.4),
('female', 52, 'height', 71.4, 73.1, 74.9, 77.3, 79.7, 82.2, 84.5, 85.9, 87.1),

-- MALE HEAD CIRCUMFERENCE (cm)
('male', 0, 'head_circumference', 32.1, 32.7, 33.5, 34.5, 35.8, 37.0, 38.1, 38.6, 39.1),
('male', 4, 'head_circumference', 35.1, 35.8, 36.6, 37.7, 39.1, 40.4, 41.6, 42.2, 42.7),
('male', 8, 'head_circumference', 37.2, 37.9, 38.8, 40.0, 41.5, 42.9, 44.2, 44.8, 45.4),
('male', 12, 'head_circumference', 38.7, 39.5, 40.4, 41.7, 43.3, 44.8, 46.1, 46.8, 47.4),
('male', 16, 'head_circumference', 39.9, 40.7, 41.7, 43.0, 44.6, 46.1, 47.5, 48.2, 48.8),
('male', 24, 'head_circumference', 41.8, 42.6, 43.6, 45.0, 46.6, 48.2, 49.6, 50.4, 51.0),
('male', 32, 'head_circumference', 43.2, 44.1, 45.1, 46.5, 48.2, 49.8, 51.3, 52.1, 52.8),
('male', 40, 'head_circumference', 44.3, 45.2, 46.3, 47.7, 49.4, 51.1, 52.6, 53.4, 54.1),
('male', 48, 'head_circumference', 45.2, 46.1, 47.2, 48.6, 50.4, 52.1, 53.7, 54.5, 55.2),
('male', 52, 'head_circumference', 45.6, 46.5, 47.6, 49.0, 50.8, 52.5, 54.1, 54.9, 55.6),

-- FEMALE HEAD CIRCUMFERENCE (cm)
('female', 0, 'head_circumference', 31.7, 32.3, 33.1, 34.1, 35.4, 36.6, 37.7, 38.2, 38.7),
('female', 4, 'head_circumference', 34.4, 35.1, 35.9, 37.0, 38.4, 39.7, 40.9, 41.5, 42.0),
('female', 8, 'head_circumference', 36.3, 37.1, 37.9, 39.1, 40.6, 42.0, 43.3, 43.9, 44.5),
('female', 12, 'head_circumference', 37.7, 38.5, 39.4, 40.6, 42.2, 43.6, 44.9, 45.6, 46.2),
('female', 16, 'head_circumference', 38.8, 39.6, 40.5, 41.8, 43.4, 44.9, 46.2, 46.9, 47.5),
('female', 24, 'head_circumference', 40.6, 41.5, 42.4, 43.7, 45.4, 46.9, 48.3, 49.0, 49.7),
('female', 32, 'head_circumference', 41.9, 42.8, 43.8, 45.1, 46.8, 48.4, 49.8, 50.5, 51.2),
('female', 40, 'head_circumference', 42.9, 43.8, 44.8, 46.2, 47.9, 49.5, 51.0, 51.7, 52.4),
('female', 48, 'head_circumference', 43.7, 44.6, 45.7, 47.1, 48.8, 50.5, 52.0, 52.7, 53.4),
('female', 52, 'head_circumference', 44.1, 45.0, 46.1, 47.5, 49.2, 50.9, 52.4, 53.1, 53.8);

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