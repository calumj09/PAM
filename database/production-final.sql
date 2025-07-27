-- PAM Production Database Schema (Final Version)
-- No timing issues - creates tables and indexes in correct order

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DROP EXISTING POLICIES TO AVOID CONFLICTS
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own children" ON children;
DROP POLICY IF EXISTS "Users can insert own children" ON children;
DROP POLICY IF EXISTS "Users can update own children" ON children;
DROP POLICY IF EXISTS "Users can delete own children" ON children;
DROP POLICY IF EXISTS "Users can manage own children" ON children;
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view checklist items for their children" ON checklist_items;
DROP POLICY IF EXISTS "Users can insert checklist items for their children" ON checklist_items;
DROP POLICY IF EXISTS "Users can update checklist items for their children" ON checklist_items;
DROP POLICY IF EXISTS "Users can delete checklist items for their children" ON checklist_items;
DROP POLICY IF EXISTS "Users can view own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can insert own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can view messages from their sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert messages to their sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can view own tracker entries" ON tracker_entries;
DROP POLICY IF EXISTS "Users can insert own tracker entries" ON tracker_entries;
DROP POLICY IF EXISTS "Users can update own tracker entries" ON tracker_entries;
DROP POLICY IF EXISTS "Users can delete own tracker entries" ON tracker_entries;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- User profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  state_territory TEXT CHECK (state_territory IN ('NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT')),
  postcode TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Children profiles with all onboarding fields
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  is_due_date BOOLEAN DEFAULT FALSE,
  baby_type TEXT CHECK (baby_type IN ('single', 'twins')),
  gender TEXT CHECK (gender IN ('boy', 'girl', 'other')),
  birth_height_cm DECIMAL(5,2),
  birth_weight_grams DECIMAL(7,2),
  head_circumference_cm DECIMAL(5,2),
  feeding_method TEXT CHECK (feeding_method IN ('breastfeeding', 'bottle', 'mixed')),
  birth_type TEXT CHECK (birth_type IN ('vaginal', 'c-section')),
  is_premium_feature BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist items with metadata
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  category TEXT CHECK (category IN ('immunization', 'registration', 'milestone', 'checkup', 'government', 'health', 'admin')) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  week_number INTEGER,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions for freemium model
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  tier TEXT CHECK (tier IN ('free', 'premium')) DEFAULT 'free',
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')) DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  ai_questions_used INTEGER DEFAULT 0,
  ai_questions_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT CHECK (tier IN ('free', 'premium')) NOT NULL,
  price_aud INTEGER NOT NULL,
  stripe_price_id TEXT,
  features JSONB DEFAULT '[]',
  popular BOOLEAN DEFAULT FALSE,
  trial_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat sessions for AI helper
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  child_id UUID REFERENCES children,
  title TEXT NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Baby tracker entries
CREATE TABLE IF NOT EXISTS tracker_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('feeding', 'sleep', 'diaper', 'medication', 'milestone', 'mood', 'temperature', 'weight', 'height')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracker_entries ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE POLICIES
-- ============================================================================

-- Profiles policies
CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- Children policies
CREATE POLICY "Users can manage own children" ON children FOR ALL USING (auth.uid() = user_id);

-- Checklist policies
CREATE POLICY "Users can manage checklist for own children" ON checklist_items
FOR ALL USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

-- Subscription policies
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage subscriptions" ON subscriptions FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Chat policies
CREATE POLICY "Users can manage own chat sessions" ON chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage messages in own sessions" ON chat_messages
FOR ALL USING (session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid()));

-- Tracker policies
CREATE POLICY "Users can manage tracker entries for own children" ON tracker_entries
FOR ALL USING (auth.uid() = user_id OR child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Mark onboarding complete when first child is added
CREATE OR REPLACE FUNCTION mark_onboarding_complete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET 
    onboarding_completed = TRUE,
    onboarding_completed_at = NOW(),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for onboarding completion
DROP TRIGGER IF EXISTS onboarding_completion_trigger ON children;
CREATE TRIGGER onboarding_completion_trigger
  AFTER INSERT ON children
  FOR EACH ROW
  EXECUTE FUNCTION mark_onboarding_complete();

-- ============================================================================
-- INDEXES (Created after tables exist)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);
CREATE INDEX IF NOT EXISTS idx_children_date_of_birth ON children(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_checklist_items_child_id ON checklist_items(child_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_due_date ON checklist_items(due_date);
CREATE INDEX IF NOT EXISTS idx_checklist_items_category ON checklist_items(category);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_tracker_entries_child_id ON tracker_entries(child_id);
CREATE INDEX IF NOT EXISTS idx_tracker_entries_user_id ON tracker_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_tracker_entries_start_time ON tracker_entries(start_time);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert subscription plans
INSERT INTO subscription_plans (id, name, tier, price_aud, features, popular, trial_days) VALUES 
('free', 'Free', 'free', 0, 
 '["Complete timeline checklist", "Local admin info", "Single baby profile", "5 AI questions/month"]',
 false, 0),
('premium_monthly', 'Premium', 'premium', 999,
 '["Unlimited AI Helper", "Multi-child profiles", "Family sharing", "Calendar sync", "Priority support"]',
 true, 7)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_aud = EXCLUDED.price_aud,
  features = EXCLUDED.features,
  popular = EXCLUDED.popular,
  trial_days = EXCLUDED.trial_days;

-- Create default free subscriptions for existing users
INSERT INTO subscriptions (user_id, tier, status)
SELECT id, 'free', 'active' FROM auth.users
WHERE id NOT IN (SELECT user_id FROM subscriptions WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '🎉 PAM Production Database Setup Complete!';
  RAISE NOTICE '✅ Onboarding will work with all baby profile fields';
  RAISE NOTICE '✅ Timeline checklist with metadata support';
  RAISE NOTICE '✅ Freemium subscription model ready';
  RAISE NOTICE '✅ AI chat and baby tracker functional';
  RAISE NOTICE '✅ All policies and indexes created successfully';
END $$;