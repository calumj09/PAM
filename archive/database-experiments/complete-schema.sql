-- PAM Complete Database Schema
-- Run this in your Supabase SQL editor to ensure all required tables and columns exist

-- 1. Base Tables
-- Users extended profile
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  state_territory TEXT,
  postcode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Children profiles
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  is_premium_feature BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist items
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  category TEXT CHECK (category IN ('immunization', 'registration', 'milestone', 'checkup')),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Extended Baby Profile Columns (for onboarding)
ALTER TABLE children ADD COLUMN IF NOT EXISTS is_due_date BOOLEAN DEFAULT FALSE;
ALTER TABLE children ADD COLUMN IF NOT EXISTS baby_type TEXT CHECK (baby_type IN ('single', 'twins'));
ALTER TABLE children ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('boy', 'girl', 'other'));
ALTER TABLE children ADD COLUMN IF NOT EXISTS birth_height_cm DECIMAL(5,2);
ALTER TABLE children ADD COLUMN IF NOT EXISTS birth_weight_grams DECIMAL(7,2);
ALTER TABLE children ADD COLUMN IF NOT EXISTS head_circumference_cm DECIMAL(5,2);
ALTER TABLE children ADD COLUMN IF NOT EXISTS feeding_method TEXT CHECK (feeding_method IN ('breastfeeding', 'bottle', 'mixed'));
ALTER TABLE children ADD COLUMN IF NOT EXISTS birth_type TEXT CHECK (birth_type IN ('vaginal', 'c-section'));
ALTER TABLE children ADD COLUMN IF NOT EXISTS family_id UUID;

-- 3. Extended Profile Columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- 4. Documents Table (for document management)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  category TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Children policies
DROP POLICY IF EXISTS "Users can view own children" ON children;
CREATE POLICY "Users can view own children" ON children FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own children" ON children;
CREATE POLICY "Users can insert own children" ON children FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own children" ON children;
CREATE POLICY "Users can update own children" ON children FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own children" ON children;
CREATE POLICY "Users can delete own children" ON children FOR DELETE USING (auth.uid() = user_id);

-- Checklist items policies
DROP POLICY IF EXISTS "Users can view checklist items for their children" ON checklist_items;
CREATE POLICY "Users can view checklist items for their children" ON checklist_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM children WHERE children.id = checklist_items.child_id AND children.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert checklist items for their children" ON checklist_items;
CREATE POLICY "Users can insert checklist items for their children" ON checklist_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM children WHERE children.id = checklist_items.child_id AND children.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update checklist items for their children" ON checklist_items;
CREATE POLICY "Users can update checklist items for their children" ON checklist_items FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM children WHERE children.id = checklist_items.child_id AND children.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete checklist items for their children" ON checklist_items;
CREATE POLICY "Users can delete checklist items for their children" ON checklist_items FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM children WHERE children.id = checklist_items.child_id AND children.user_id = auth.uid()
  )
);

-- Documents policies
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
CREATE POLICY "Users can insert own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own documents" ON documents;
CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own documents" ON documents;
CREATE POLICY "Users can delete own documents" ON documents FOR DELETE USING (auth.uid() = user_id);

-- 7. Helper Functions and Triggers

-- Function to automatically mark onboarding complete when first child is added
CREATE OR REPLACE FUNCTION mark_onboarding_complete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET 
    onboarding_completed = TRUE,
    onboarding_completed_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically mark onboarding complete when first child is added
DROP TRIGGER IF EXISTS onboarding_completion_trigger ON children;
CREATE TRIGGER onboarding_completion_trigger
  AFTER INSERT ON children
  FOR EACH ROW
  EXECUTE FUNCTION mark_onboarding_complete();

-- 8. Storage Bucket for Documents (run separately in Supabase Dashboard)
-- This needs to be created in the Supabase Storage section:
-- Bucket name: documents
-- Public: false
-- File size limit: 10MB
-- Allowed MIME types: image/*, application/pdf

COMMENT ON TABLE profiles IS 'Extended user profiles with Australian location data';
COMMENT ON TABLE children IS 'Child profiles with detailed onboarding information';
COMMENT ON TABLE checklist_items IS 'Auto-generated tasks and milestones for children';
COMMENT ON TABLE documents IS 'Secure document storage for families';

-- Success message
SELECT 'PAM database schema setup complete! All tables, columns, and policies created.' as status;