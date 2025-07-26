-- Growth Tracking Schema for PAM
-- Enables tracking of child growth measurements with Australian/WHO standards

-- Growth measurements (height, weight, head circumference)
CREATE TABLE growth_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  
  -- Measurement context
  measured_by UUID REFERENCES auth.users(id),
  measurement_location TEXT, -- 'home', 'gp', 'hospital', 'childcare'
  notes TEXT,
  
  -- Data quality
  is_estimated BOOLEAN DEFAULT false, -- If measurement was estimated vs precise
  measurement_method TEXT, -- 'digital_scale', 'tape_measure', 'growth_chart', etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Growth milestones and developmental markers
CREATE TABLE growth_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  
  -- Milestone details
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('physical', 'cognitive', 'social', 'motor')),
  milestone_name TEXT NOT NULL,
  description TEXT,
  
  -- Timing
  achieved_date DATE,
  expected_age_weeks INTEGER, -- When this milestone is typically achieved
  age_achieved_weeks INTEGER, -- Actual age when achieved
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'achieved', 'delayed', 'not_applicable')),
  
  -- Australian developmental guidelines reference
  nhmrc_guideline_reference TEXT,
  severity_if_delayed TEXT CHECK (severity_if_delayed IN ('mild', 'moderate', 'significant')),
  
  -- Recording details
  recorded_by UUID REFERENCES auth.users(id),
  verified_by_professional BOOLEAN DEFAULT false,
  professional_name TEXT,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Growth alerts and recommendations
CREATE TABLE growth_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  
  -- Reference data
  triggered_by_measurement_id UUID REFERENCES growth_measurements(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Australian/WHO growth reference data (percentile curves)
CREATE TABLE growth_reference_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
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
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(sex, age_weeks, measurement_type)
);

-- Growth tracking settings (per child)
CREATE TABLE growth_tracking_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  
  -- Tracking preferences
  track_height BOOLEAN DEFAULT true,
  track_weight BOOLEAN DEFAULT true,
  track_head_circumference BOOLEAN DEFAULT true,
  
  -- Alert thresholds
  low_percentile_alert_threshold DECIMAL(5,2) DEFAULT 3.00, -- Alert if below 3rd percentile
  high_percentile_alert_threshold DECIMAL(5,2) DEFAULT 97.00, -- Alert if above 97th percentile
  rapid_change_threshold DECIMAL(5,2) DEFAULT 25.00, -- Alert if percentile changes by >25 points
  
  -- Measurement reminders
  measurement_reminder_enabled BOOLEAN DEFAULT true,
  measurement_frequency_weeks INTEGER DEFAULT 4, -- Remind every 4 weeks
  last_reminder_sent TIMESTAMP WITH TIME ZONE,
  
  -- Display preferences
  preferred_units TEXT DEFAULT 'metric' CHECK (preferred_units IN ('metric', 'imperial')),
  show_percentiles BOOLEAN DEFAULT true,
  show_reference_curves BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(child_id)
);

-- Create indexes for performance
CREATE INDEX idx_growth_measurements_child_date ON growth_measurements(child_id, measurement_date DESC);
CREATE INDEX idx_growth_measurements_child_age ON growth_measurements(child_id, age_weeks);
CREATE INDEX idx_growth_milestones_child ON growth_milestones(child_id, expected_age_weeks);
CREATE INDEX idx_growth_alerts_child ON growth_alerts(child_id, created_at DESC);
CREATE INDEX idx_growth_reference_lookup ON growth_reference_data(sex, measurement_type, age_weeks);

-- Row Level Security
ALTER TABLE growth_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_tracking_settings ENABLE ROW LEVEL SECURITY;

-- Growth Measurements RLS
CREATE POLICY "Users can view measurements for children in their families" ON growth_measurements
  FOR SELECT USING (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can add measurements for children in their families" ON growth_measurements
  FOR INSERT WITH CHECK (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own measurements" ON growth_measurements
  FOR UPDATE USING (measured_by = auth.uid());

-- Growth Milestones RLS
CREATE POLICY "Users can view milestones for children in their families" ON growth_milestones
  FOR SELECT USING (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage milestones for children in their families" ON growth_milestones
  FOR ALL USING (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Growth Alerts RLS
CREATE POLICY "Users can view alerts for children in their families" ON growth_alerts
  FOR SELECT USING (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can acknowledge alerts for children in their families" ON growth_alerts
  FOR UPDATE USING (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Growth Tracking Settings RLS
CREATE POLICY "Users can manage settings for children in their families" ON growth_tracking_settings
  FOR ALL USING (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'partner')
      )
    )
  );

-- Functions for growth tracking

-- Calculate percentile for a measurement
CREATE OR REPLACE FUNCTION calculate_growth_percentile(
  child_sex TEXT,
  age_in_weeks INTEGER,
  measurement_type TEXT,
  measurement_value DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  ref_data growth_reference_data%ROWTYPE;
  percentile DECIMAL;
BEGIN
  -- Get reference data for this age/sex/measurement
  SELECT * INTO ref_data 
  FROM growth_reference_data 
  WHERE sex = child_sex 
    AND measurement_type = calculate_growth_percentile.measurement_type
    AND age_weeks = age_in_weeks;
  
  IF NOT FOUND THEN
    -- If exact age not found, interpolate or return null
    RETURN NULL;
  END IF;
  
  -- Simple percentile calculation (in production, would use proper statistical interpolation)
  CASE 
    WHEN measurement_value <= ref_data.p3 THEN percentile := 3
    WHEN measurement_value <= ref_data.p5 THEN percentile := 5
    WHEN measurement_value <= ref_data.p10 THEN percentile := 10
    WHEN measurement_value <= ref_data.p25 THEN percentile := 25
    WHEN measurement_value <= ref_data.p50 THEN percentile := 50
    WHEN measurement_value <= ref_data.p75 THEN percentile := 75
    WHEN measurement_value <= ref_data.p90 THEN percentile := 90
    WHEN measurement_value <= ref_data.p95 THEN percentile := 95
    WHEN measurement_value <= ref_data.p97 THEN percentile := 97
    ELSE percentile := 99
  END CASE;
  
  RETURN percentile;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate percentiles on measurement insert
CREATE OR REPLACE FUNCTION calculate_measurement_percentiles()
RETURNS TRIGGER AS $$
DECLARE
  child_record children%ROWTYPE;
  child_sex TEXT;
BEGIN
  -- Get child details
  SELECT * INTO child_record FROM children WHERE id = NEW.child_id;
  
  -- Determine sex (you'd get this from child profile)
  -- For now, we'll need to add this to children table or handle differently
  child_sex := 'male'; -- Default - would need proper implementation
  
  -- Calculate percentiles for each measurement
  IF NEW.height_cm IS NOT NULL THEN
    NEW.height_percentile := calculate_growth_percentile(
      child_sex, NEW.age_weeks, 'height', NEW.height_cm
    );
  END IF;
  
  IF NEW.weight_kg IS NOT NULL THEN
    NEW.weight_percentile := calculate_growth_percentile(
      child_sex, NEW.age_weeks, 'weight', NEW.weight_kg
    );
  END IF;
  
  IF NEW.head_circumference_cm IS NOT NULL THEN
    NEW.head_circumference_percentile := calculate_growth_percentile(
      child_sex, NEW.age_weeks, 'head_circumference', NEW.head_circumference_cm
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_percentiles
  BEFORE INSERT OR UPDATE ON growth_measurements
  FOR EACH ROW
  EXECUTE FUNCTION calculate_measurement_percentiles();

-- Function to check for growth alerts
CREATE OR REPLACE FUNCTION check_growth_alerts(measurement_id UUID)
RETURNS VOID AS $$
DECLARE
  measurement growth_measurements%ROWTYPE;
  settings growth_tracking_settings%ROWTYPE;
  prev_measurement growth_measurements%ROWTYPE;
  alert_needed BOOLEAN := FALSE;
  alert_message TEXT;
  alert_severity TEXT;
BEGIN
  -- Get the measurement
  SELECT * INTO measurement FROM growth_measurements WHERE id = measurement_id;
  
  -- Get tracking settings
  SELECT * INTO settings FROM growth_tracking_settings WHERE child_id = measurement.child_id;
  
  -- Get previous measurement
  SELECT * INTO prev_measurement 
  FROM growth_measurements 
  WHERE child_id = measurement.child_id 
    AND measurement_date < measurement.measurement_date 
  ORDER BY measurement_date DESC 
  LIMIT 1;
  
  -- Check for low percentile alerts
  IF measurement.height_percentile IS NOT NULL AND 
     measurement.height_percentile < COALESCE(settings.low_percentile_alert_threshold, 3) THEN
    
    INSERT INTO growth_alerts (
      child_id, alert_type, severity, measurement_type, current_percentile,
      title, message, recommendation, gp_consultation_recommended, triggered_by_measurement_id
    ) VALUES (
      measurement.child_id, 'low_percentile', 'medium', 'height', measurement.height_percentile,
      'Height Below Expected Range',
      'Your child''s height is below the ' || settings.low_percentile_alert_threshold || 'rd percentile for their age.',
      'Consider discussing this with your GP to ensure healthy growth and development.',
      TRUE, measurement_id
    );
  END IF;
  
  -- Similar checks for weight and head circumference would go here
  
END;
$$ LANGUAGE plpgsql;

-- Trigger to check alerts after measurement insert
CREATE OR REPLACE FUNCTION trigger_growth_alert_check()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_growth_alerts(NEW.id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_growth_alerts
  AFTER INSERT ON growth_measurements
  FOR EACH ROW
  EXECUTE FUNCTION trigger_growth_alert_check();