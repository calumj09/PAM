-- PAM Complete Database Schema
-- This file contains ALL tables and columns needed for full functionality
-- Run this in your Supabase SQL editor to get everything working

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users extended profile
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  state_territory TEXT,
  postcode TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Children profiles with ALL columns
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
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
  family_id UUID,
  is_premium_feature BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist items with metadata
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  category TEXT CHECK (category IN ('immunization', 'registration', 'milestone', 'checkup')),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat sessions for AI helper
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  child_id UUID REFERENCES children,
  title TEXT NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  tier TEXT CHECK (tier IN ('free', 'premium')) DEFAULT 'free',
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_end TIMESTAMPTZ,
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

-- Baby tracker entries
CREATE TABLE IF NOT EXISTS tracker_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children,
  user_id UUID REFERENCES auth.users,
  type TEXT NOT NULL CHECK (type IN ('feeding', 'sleep', 'diaper', 'medication', 'milestone', 'mood', 'temperature', 'weight', 'height')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracker_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for children
CREATE POLICY "Users can view own children" ON children FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own children" ON children FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own children" ON children FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own children" ON children FOR DELETE USING (auth.uid() = user_id);

-- Create policies for checklist items
CREATE POLICY "Users can view checklist items for their children" ON checklist_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM children WHERE children.id = checklist_items.child_id AND children.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert checklist items for their children" ON checklist_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM children WHERE children.id = checklist_items.child_id AND children.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update checklist items for their children" ON checklist_items FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM children WHERE children.id = checklist_items.child_id AND children.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete checklist items for their children" ON checklist_items FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM children WHERE children.id = checklist_items.child_id AND children.user_id = auth.uid()
  )
);

-- Create policies for chat
CREATE POLICY "Users can view own chat sessions" ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat sessions" ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat sessions" ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages from their sessions" ON chat_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert messages to their sessions" ON chat_messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()
  )
);

-- Create policies for subscriptions
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage subscriptions" ON subscriptions FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Create policies for tracker entries
CREATE POLICY "Users can view own tracker entries" ON tracker_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tracker entries" ON tracker_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tracker entries" ON tracker_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tracker entries" ON tracker_entries FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically mark onboarding complete
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

-- Create trigger for onboarding completion
DROP TRIGGER IF EXISTS onboarding_completion_trigger ON children;
CREATE TRIGGER onboarding_completion_trigger
  AFTER INSERT ON children
  FOR EACH ROW
  EXECUTE FUNCTION mark_onboarding_complete();

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, tier, price_aud, features, popular, trial_days) VALUES 
('free', 'Free', 'free', 0, '["2 children profiles", "Activity tracking", "Basic analytics", "Limited AI chat"]', false, 0),
('premium_monthly', 'Premium', 'premium', 999, '["Unlimited children profiles", "Activity tracking", "Advanced analytics", "Unlimited AI chat", "Google Calendar sync", "Data export", "Priority support"]', true, 7)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_aud = EXCLUDED.price_aud,
  features = EXCLUDED.features,
  popular = EXCLUDED.popular,
  trial_days = EXCLUDED.trial_days;

-- Create a default free subscription for all existing users
INSERT INTO subscriptions (user_id, tier, status)
SELECT id, 'free', 'active' FROM auth.users
WHERE id NOT IN (SELECT user_id FROM subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_child_id ON checklist_items(child_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_due_date ON checklist_items(due_date);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_tracker_entries_child_id ON tracker_entries(child_id);
CREATE INDEX IF NOT EXISTS idx_tracker_entries_user_id ON tracker_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_tracker_entries_start_time ON tracker_entries(start_time);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'PAM database schema setup complete! All tables and columns are now available.';
END $$;