-- Medication Tracking Schema for PAM
-- Enables tracking of medications, doses, and reminders for Australian children

-- Australian medication database (TGA approved pediatric medications)
CREATE TABLE medication_database (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  generic_name TEXT,
  brand_names TEXT[], -- Array of common brand names
  medication_type TEXT NOT NULL CHECK (medication_type IN ('paracetamol', 'ibuprofen', 'antibiotic', 'prescription', 'vitamin', 'other')),
  active_ingredient TEXT NOT NULL,
  strength_mg DECIMAL,
  forms TEXT[] DEFAULT '{}', -- ['liquid', 'tablet', 'suppository', 'drops']
  age_restriction_months INTEGER DEFAULT 0, -- Minimum age in months
  
  -- Australian-specific dosing guidelines
  dosing_guidelines JSONB DEFAULT '{}', -- Age/weight based dosing
  max_daily_dose_mg DECIMAL,
  dosing_interval_hours INTEGER DEFAULT 4,
  
  -- Safety information
  contraindications TEXT[],
  interactions TEXT[],
  side_effects TEXT[],
  
  -- TGA information
  tga_approved BOOLEAN DEFAULT true,
  schedule_classification TEXT, -- S2, S3, S4, S8 etc
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Child medications (active prescriptions/medications)
CREATE TABLE child_medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medication_database(id),
  
  -- Custom medication (if not in database)
  custom_name TEXT,
  custom_strength_mg DECIMAL,
  custom_form TEXT,
  
  -- Prescription details
  prescribed_by TEXT, -- Doctor name
  prescription_date DATE,
  prescription_number TEXT,
  pharmacy TEXT,
  
  -- Dosing information
  dose_amount DECIMAL NOT NULL, -- e.g., 2.5ml, 100mg
  dose_unit TEXT NOT NULL, -- 'ml', 'mg', 'tablets'
  frequency_per_day INTEGER NOT NULL DEFAULT 1,
  interval_hours INTEGER DEFAULT 8,
  
  -- Schedule
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE, -- NULL for ongoing/as needed
  is_as_needed BOOLEAN DEFAULT false,
  
  -- Additional info
  instructions TEXT,
  notes TEXT,
  food_instructions TEXT, -- 'with food', 'on empty stomach', etc
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: must have either medication_id OR custom fields
  CONSTRAINT check_medication_source CHECK (
    (medication_id IS NOT NULL AND custom_name IS NULL) OR
    (medication_id IS NULL AND custom_name IS NOT NULL)
  )
);

-- Medication doses (actual administration log)
CREATE TABLE medication_doses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_medication_id UUID REFERENCES child_medications(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  
  -- Dose details
  dose_amount DECIMAL NOT NULL,
  dose_unit TEXT NOT NULL,
  administered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Administration details
  administered_by UUID REFERENCES auth.users(id),
  administration_method TEXT, -- 'oral', 'rectal', 'topical'
  
  -- Context
  reason TEXT, -- 'fever', 'pain', 'scheduled dose'
  child_weight_kg DECIMAL, -- Weight at time of dose (for dosing calculations)
  temperature_celsius DECIMAL, -- If given for fever
  
  -- Status
  was_scheduled BOOLEAN DEFAULT false, -- Was this a scheduled dose or as-needed
  reminder_id UUID, -- Reference to notification reminder
  
  -- Notes
  notes TEXT,
  side_effects_noted TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication reminders/schedules
CREATE TABLE medication_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_medication_id UUID REFERENCES child_medications(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  
  -- Schedule details
  reminder_time TIME NOT NULL, -- e.g., 08:00, 14:00, 20:00
  days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
  
  -- Reminder settings
  advance_notice_minutes INTEGER DEFAULT 15, -- Remind 15 mins before
  is_active BOOLEAN DEFAULT true,
  
  -- Tracking
  next_reminder_at TIMESTAMP WITH TIME ZONE,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication safety alerts
CREATE TABLE medication_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('max_dose_exceeded', 'interaction_warning', 'allergy_warning', 'age_restriction')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Alert details
  medication_ids UUID[], -- Array of medication IDs involved
  message TEXT NOT NULL,
  recommendation TEXT,
  
  -- Status
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_child_medications_child_id ON child_medications(child_id);
CREATE INDEX idx_child_medications_active ON child_medications(child_id, is_active);
CREATE INDEX idx_medication_doses_child_id ON medication_doses(child_id);
CREATE INDEX idx_medication_doses_administered_at ON medication_doses(administered_at);
CREATE INDEX idx_medication_reminders_child_id ON medication_reminders(child_id);
CREATE INDEX idx_medication_reminders_next ON medication_reminders(next_reminder_at) WHERE is_active = true;
CREATE INDEX idx_medication_database_type ON medication_database(medication_type);

-- Row Level Security
ALTER TABLE child_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_doses ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_alerts ENABLE ROW LEVEL SECURITY;

-- Child Medications RLS
CREATE POLICY "Users can view medications for children in their families" ON child_medications
  FOR SELECT USING (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage medications for children in their families" ON child_medications
  FOR ALL USING (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'partner', 'caregiver')
      )
    )
  );

-- Medication Doses RLS
CREATE POLICY "Users can view doses for children in their families" ON medication_doses
  FOR SELECT USING (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can log doses for children in their families" ON medication_doses
  FOR INSERT WITH CHECK (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own dose entries" ON medication_doses
  FOR UPDATE USING (administered_by = auth.uid());

-- Medication Reminders RLS
CREATE POLICY "Users can view reminders for children in their families" ON medication_reminders
  FOR SELECT USING (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage reminders for children in their families" ON medication_reminders
  FOR ALL USING (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'partner', 'caregiver')
      )
    )
  );

-- Medication Alerts RLS
CREATE POLICY "Users can view alerts for children in their families" ON medication_alerts
  FOR SELECT USING (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can acknowledge alerts for children in their families" ON medication_alerts
  FOR UPDATE USING (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Functions for medication management

-- Function to calculate recommended dose based on Australian guidelines
CREATE OR REPLACE FUNCTION calculate_recommended_dose(
  medication_id UUID,
  child_age_months INTEGER,
  child_weight_kg DECIMAL DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  med_record medication_database%ROWTYPE;
  guidelines JSONB;
  recommended_dose DECIMAL;
  max_dose DECIMAL;
BEGIN
  -- Get medication details
  SELECT * INTO med_record FROM medication_database WHERE id = medication_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Medication not found');
  END IF;
  
  -- Check age restrictions
  IF child_age_months < med_record.age_restriction_months THEN
    RETURN json_build_object(
      'error', 'Child too young for this medication',
      'min_age_months', med_record.age_restriction_months
    );
  END IF;
  
  guidelines := med_record.dosing_guidelines;
  
  -- Calculate dose based on age/weight (simplified logic)
  -- In production, this would have complex Australian dosing guidelines
  CASE med_record.medication_type
    WHEN 'paracetamol' THEN
      -- Paracetamol: 15mg/kg every 4-6 hours, max 60mg/kg/day
      IF child_weight_kg IS NOT NULL THEN
        recommended_dose := child_weight_kg * 15;
        max_dose := child_weight_kg * 60;
      ELSE
        -- Age-based dosing
        recommended_dose := CASE 
          WHEN child_age_months < 12 THEN 80  -- 2.5ml of infant drops
          WHEN child_age_months < 24 THEN 160 -- 5ml of infant drops
          WHEN child_age_months < 48 THEN 240 -- 7.5ml of children's liquid
          ELSE 320 -- 10ml of children's liquid
        END;
        max_dose := recommended_dose * 4; -- 4 doses per day max
      END IF;
    
    WHEN 'ibuprofen' THEN
      -- Ibuprofen: 5-10mg/kg every 6-8 hours, max 30mg/kg/day
      -- Not for under 3 months
      IF child_age_months < 3 THEN
        RETURN json_build_object('error', 'Ibuprofen not recommended under 3 months');
      END IF;
      
      IF child_weight_kg IS NOT NULL THEN
        recommended_dose := child_weight_kg * 7.5; -- Mid-range
        max_dose := child_weight_kg * 30;
      ELSE
        recommended_dose := CASE 
          WHEN child_age_months < 12 THEN 50   -- 2.5ml
          WHEN child_age_months < 24 THEN 100  -- 5ml
          WHEN child_age_months < 48 THEN 150  -- 7.5ml
          ELSE 200 -- 10ml
        END;
        max_dose := recommended_dose * 3; -- 3 doses per day max
      END IF;
    
    ELSE
      -- For other medications, use database guidelines or return error
      recommended_dose := 0;
      max_dose := med_record.max_daily_dose_mg;
  END CASE;
  
  RETURN json_build_object(
    'recommended_dose_mg', recommended_dose,
    'max_daily_dose_mg', COALESCE(max_dose, med_record.max_daily_dose_mg),
    'dosing_interval_hours', med_record.dosing_interval_hours,
    'medication_name', med_record.name,
    'strength_mg', med_record.strength_mg
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for dose safety
CREATE OR REPLACE FUNCTION check_dose_safety(
  p_child_id UUID,
  p_medication_id UUID,
  p_dose_amount DECIMAL,
  p_dose_unit TEXT
) RETURNS JSONB AS $$
DECLARE
  total_today DECIMAL := 0;
  med_record medication_database%ROWTYPE;
  child_record children%ROWTYPE;
  last_dose_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get medication and child details
  SELECT * INTO med_record FROM medication_database WHERE id = p_medication_id;
  SELECT * INTO child_record FROM children WHERE id = p_child_id;
  
  -- Calculate total doses given today
  SELECT COALESCE(SUM(dose_amount), 0) INTO total_today
  FROM medication_doses md
  JOIN child_medications cm ON md.child_medication_id = cm.id
  WHERE md.child_id = p_child_id 
    AND cm.medication_id = p_medication_id
    AND md.administered_at >= CURRENT_DATE;
  
  -- Get last dose time
  SELECT MAX(administered_at) INTO last_dose_time
  FROM medication_doses md
  JOIN child_medications cm ON md.child_medication_id = cm.id
  WHERE md.child_id = p_child_id 
    AND cm.medication_id = p_medication_id;
  
  -- Check if adding this dose would exceed daily maximum
  IF med_record.max_daily_dose_mg IS NOT NULL AND 
     (total_today + p_dose_amount) > med_record.max_daily_dose_mg THEN
    RETURN json_build_object(
      'safe', false,
      'warning', 'Maximum daily dose would be exceeded',
      'current_daily_total', total_today,
      'max_daily_dose', med_record.max_daily_dose_mg
    );
  END IF;
  
  -- Check minimum interval between doses
  IF last_dose_time IS NOT NULL AND 
     last_dose_time + (med_record.dosing_interval_hours || ' hours')::INTERVAL > NOW() THEN
    RETURN json_build_object(
      'safe', false,
      'warning', 'Too soon since last dose',
      'last_dose_time', last_dose_time,
      'minimum_interval_hours', med_record.dosing_interval_hours,
      'next_safe_time', last_dose_time + (med_record.dosing_interval_hours || ' hours')::INTERVAL
    );
  END IF;
  
  RETURN json_build_object(
    'safe', true,
    'current_daily_total', total_today,
    'max_daily_dose', med_record.max_daily_dose_mg
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;