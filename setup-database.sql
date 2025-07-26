-- PAM Database Setup Script
-- Run this in your Supabase SQL Editor to set up all tables and security

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table for user information
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  state_territory TEXT,
  postcode TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Children table
CREATE TABLE children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID,
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  sex TEXT CHECK (sex IN ('male', 'female')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family sharing tables
CREATE TABLE families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'partner', 'caregiver', 'grandparent')),
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

CREATE TABLE family_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('partner', 'caregiver', 'grandparent')),
  token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Growth tracking tables
CREATE TABLE growth_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  age_weeks INTEGER NOT NULL,
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,3),
  head_circumference_cm DECIMAL(5,2),
  height_percentile DECIMAL(5,2),
  weight_percentile DECIMAL(5,2),
  head_circumference_percentile DECIMAL(5,2),
  weight_for_height_percentile DECIMAL(5,2),
  measured_by UUID REFERENCES auth.users(id),
  measurement_location TEXT,
  notes TEXT,
  is_estimated BOOLEAN DEFAULT false,
  measurement_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE growth_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_percentile', 'high_percentile', 'rapid_change', 'no_growth', 'milestone_delay')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'low', 'medium', 'high', 'urgent')),
  measurement_type TEXT,
  current_percentile DECIMAL(5,2),
  previous_percentile DECIMAL(5,2),
  percentile_change DECIMAL(5,2),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  recommendation TEXT,
  gp_consultation_recommended BOOLEAN DEFAULT false,
  urgent_medical_attention BOOLEAN DEFAULT false,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  triggered_by_measurement_id UUID REFERENCES growth_measurements(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE growth_reference_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  age_weeks INTEGER NOT NULL,
  measurement_type TEXT NOT NULL CHECK (measurement_type IN ('height', 'weight', 'head_circumference', 'weight_for_height')),
  p3 DECIMAL(6,3),
  p5 DECIMAL(6,3),
  p10 DECIMAL(6,3),
  p25 DECIMAL(6,3),
  p50 DECIMAL(6,3),
  p75 DECIMAL(6,3),
  p90 DECIMAL(6,3),
  p95 DECIMAL(6,3),
  p97 DECIMAL(6,3),
  source TEXT DEFAULT 'WHO_2006',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sex, age_weeks, measurement_type)
);

-- Baby tracking tables
CREATE TABLE activity_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  category_id UUID REFERENCES activity_categories(id),
  type TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  amount DECIMAL(10,2),
  unit TEXT,
  notes TEXT,
  mood TEXT CHECK (mood IN ('happy', 'fussy', 'sleepy', 'alert', 'calm')),
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication tracking tables
CREATE TABLE medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand_name TEXT,
  generic_name TEXT,
  tga_approved BOOLEAN DEFAULT true,
  active_ingredients JSONB,
  dosage_forms TEXT[],
  age_restrictions JSONB,
  weight_based_dosing JSONB,
  max_daily_dose JSONB,
  minimum_interval_hours INTEGER,
  side_effects TEXT[],
  contraindications TEXT[],
  australian_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE child_medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id),
  custom_name TEXT,
  dose_amount DECIMAL(10,3) NOT NULL,
  dose_unit TEXT NOT NULL,
  frequency_per_day INTEGER DEFAULT 1,
  interval_hours INTEGER DEFAULT 24,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  prescribed_by TEXT,
  prescription_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE medication_doses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_medication_id UUID REFERENCES child_medications(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  dose_amount DECIMAL(10,3) NOT NULL,
  dose_unit TEXT NOT NULL,
  administered_at TIMESTAMP WITH TIME ZONE NOT NULL,
  administered_by UUID REFERENCES auth.users(id),
  administration_method TEXT DEFAULT 'oral' CHECK (administration_method IN ('oral', 'rectal', 'topical', 'nasal')),
  reason TEXT,
  temperature_celsius DECIMAL(4,1),
  was_scheduled BOOLEAN DEFAULT false,
  notes TEXT,
  side_effects_noted TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automated checklist tables
CREATE TABLE checklist_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('immunisation', 'registration', 'milestone', 'health_check')),
  age_weeks_min INTEGER,
  age_weeks_max INTEGER,
  state_specific TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  description TEXT,
  instructions TEXT,
  requirements JSONB,
  government_links JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  template_id UUID REFERENCES checklist_templates(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  due_date DATE,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'not_applicable')),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'alert', 'milestone', 'medication', 'appointment')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_doses ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for children
CREATE POLICY "Users can view their children" ON children FOR SELECT USING (
  user_id = auth.uid() OR 
  family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert their children" ON children FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their children" ON children FOR UPDATE USING (
  user_id = auth.uid() OR 
  family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role IN ('owner', 'partner'))
);

-- RLS Policies for family members
CREATE POLICY "Users can view family members" ON family_members FOR SELECT USING (
  user_id = auth.uid() OR 
  family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
);

-- RLS Policies for growth measurements
CREATE POLICY "Users can view growth measurements" ON growth_measurements FOR SELECT USING (
  child_id IN (
    SELECT id FROM children 
    WHERE user_id = auth.uid() OR family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "Users can insert growth measurements" ON growth_measurements FOR INSERT WITH CHECK (
  child_id IN (
    SELECT id FROM children 
    WHERE user_id = auth.uid() OR family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  )
);

-- RLS Policies for activities
CREATE POLICY "Users can view activities" ON activities FOR SELECT USING (
  child_id IN (
    SELECT id FROM children 
    WHERE user_id = auth.uid() OR family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "Users can insert activities" ON activities FOR INSERT WITH CHECK (
  child_id IN (
    SELECT id FROM children 
    WHERE user_id = auth.uid() OR family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  )
);

-- Create indexes for performance
CREATE INDEX idx_children_user_id ON children(user_id);
CREATE INDEX idx_children_family_id ON children(family_id);
CREATE INDEX idx_growth_measurements_child_date ON growth_measurements(child_id, measurement_date DESC);
CREATE INDEX idx_activities_child_time ON activities(child_id, start_time DESC);
CREATE INDEX idx_family_members_user ON family_members(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, scheduled_for);

-- Insert activity categories
INSERT INTO activity_categories (name, icon, color) VALUES
  ('Feeding', '🍼', '#10B981'),
  ('Sleep', '😴', '#6366F1'),
  ('Diaper', '👶', '#F59E0B'),
  ('Play', '🧸', '#EF4444'),
  ('Bath', '🛁', '#06B6D4'),
  ('Medicine', '💊', '#8B5CF6'),
  ('Milestone', '🎯', '#EC4899');

-- Insert sample Australian medication data
INSERT INTO medications (
  name, brand_name, generic_name, tga_approved, 
  active_ingredients, dosage_forms, age_restrictions,
  weight_based_dosing, max_daily_dose, minimum_interval_hours,
  side_effects, australian_category
) VALUES
  (
    'Panadol Baby & Infant Drops', 'Panadol', 'paracetamol', true,
    '{"paracetamol": "80mg/0.8ml"}', ARRAY['oral_drops'],
    '{"min_age_months": 1, "max_age_months": 24}',
    '{"dose_per_kg": 15, "unit": "mg"}',
    '{"daily_max_mg_per_kg": 60}', 4,
    ARRAY['nausea', 'rash'], 'A'
  ),
  (
    'Nurofen for Children', 'Nurofen', 'ibuprofen', true,
    '{"ibuprofen": "100mg/5ml"}', ARRAY['oral_suspension'],
    '{"min_age_months": 3, "max_age_months": 120}',
    '{"dose_per_kg": 10, "unit": "mg"}',
    '{"daily_max_mg_per_kg": 30}', 8,
    ARRAY['stomach_upset', 'drowsiness'], 'C'
  );

-- Insert sample checklist templates for Australian requirements
INSERT INTO checklist_templates (
  name, category, age_weeks_min, age_weeks_max, 
  priority, description, instructions, government_links
) VALUES
  (
    'Birth Certificate Application', 'registration', 0, 8, 'high',
    'Register your baby''s birth and apply for birth certificate',
    'Apply within 60 days of birth. Required for passport and other documents.',
    '{"vic": "https://www.bdm.vic.gov.au/births", "nsw": "https://www.nsw.gov.au/topics/births-deaths-marriages/births"}'
  ),
  (
    '6-Week Immunisation', 'immunisation', 4, 8, 'urgent',
    'First round of childhood immunisations at 6 weeks',
    'Book with GP or immunisation clinic. Includes DTPa-hepB-IPV-Hib, 13vPCV, Rotavirus',
    '{"national": "https://www.health.gov.au/resources/publications/national-immunisation-program-schedule"}'
  ),
  (
    '4-Month Immunisation', 'immunisation', 14, 18, 'urgent',
    'Second round of childhood immunisations at 4 months',
    'Continue immunisation schedule with DTPa-hepB-IPV-Hib, 13vPCV, Rotavirus',
    '{"national": "https://www.health.gov.au/resources/publications/national-immunisation-program-schedule"}'
  );

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert WHO growth reference data (sample data)
INSERT INTO growth_reference_data (sex, age_weeks, measurement_type, p3, p5, p10, p25, p50, p75, p90, p95, p97) VALUES
  -- Birth (0 weeks) - Male
  ('male', 0, 'height', 46.1, 46.8, 47.9, 49.0, 49.9, 50.8, 51.8, 52.3, 52.7),
  ('male', 0, 'weight', 2.5, 2.6, 2.8, 3.0, 3.3, 3.6, 3.9, 4.1, 4.2),
  ('male', 0, 'head_circumference', 32.6, 33.0, 33.6, 34.3, 34.9, 35.6, 36.2, 36.6, 36.9),
  
  -- 6 months (26 weeks) - Male
  ('male', 26, 'height', 63.3, 64.1, 65.2, 66.4, 67.6, 68.9, 70.1, 70.9, 71.4),
  ('male', 26, 'weight', 6.4, 6.7, 7.1, 7.5, 7.9, 8.4, 9.0, 9.4, 9.7),
  ('male', 26, 'head_circumference', 41.5, 42.0, 42.6, 43.3, 43.9, 44.6, 45.2, 45.6, 45.9),
  
  -- 12 months (52 weeks) - Male
  ('male', 52, 'height', 71.0, 71.9, 73.1, 74.5, 75.7, 77.1, 78.4, 79.2, 79.8),
  ('male', 52, 'weight', 7.7, 8.1, 8.6, 9.2, 9.6, 10.2, 10.9, 11.3, 11.7),
  ('male', 52, 'head_circumference', 44.6, 45.1, 45.7, 46.4, 47.0, 47.7, 48.3, 48.7, 49.0),
  
  -- Female data
  ('female', 0, 'height', 45.4, 46.1, 47.1, 48.2, 49.1, 50.0, 50.9, 51.4, 51.7),
  ('female', 0, 'weight', 2.4, 2.5, 2.7, 2.8, 3.2, 3.4, 3.7, 3.9, 4.0),
  ('female', 0, 'head_circumference', 32.0, 32.4, 33.0, 33.7, 34.3, 34.9, 35.5, 35.9, 36.2),
  
  ('female', 26, 'height', 61.8, 62.6, 63.8, 65.0, 66.1, 67.3, 68.5, 69.2, 69.8),
  ('female', 26, 'weight', 5.8, 6.1, 6.5, 6.9, 7.3, 7.8, 8.3, 8.7, 9.0),
  ('female', 26, 'head_circumference', 40.2, 40.7, 41.3, 42.0, 42.6, 43.2, 43.8, 44.2, 44.5),
  
  ('female', 52, 'height', 68.9, 69.8, 71.0, 72.4, 74.0, 75.3, 76.6, 77.5, 78.0),
  ('female', 52, 'weight', 7.0, 7.4, 7.8, 8.4, 8.9, 9.5, 10.1, 10.5, 10.9),
  ('female', 52, 'head_circumference', 43.2, 43.7, 44.3, 45.0, 45.6, 46.3, 46.9, 47.3, 47.6);

-- Database setup complete!
SELECT 'PAM Database setup completed successfully!' as status;