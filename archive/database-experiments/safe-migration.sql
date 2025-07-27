-- PAM Safe Migration Script
-- This handles existing tables and adds only what's missing
-- Safe to run multiple times

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add missing columns to profiles table if they don't exist
DO $$ 
BEGIN
    -- Add onboarding_completed column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add onboarding_completed_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'onboarding_completed_at') THEN
        ALTER TABLE profiles ADD COLUMN onboarding_completed_at TIMESTAMPTZ;
    END IF;
    
    -- Add updated_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Add missing columns to children table
DO $$ 
BEGIN
    -- Add is_due_date column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'children' AND column_name = 'is_due_date') THEN
        ALTER TABLE children ADD COLUMN is_due_date BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add baby_type column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'children' AND column_name = 'baby_type') THEN
        ALTER TABLE children ADD COLUMN baby_type TEXT CHECK (baby_type IN ('single', 'twins'));
    END IF;
    
    -- Add gender column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'children' AND column_name = 'gender') THEN
        ALTER TABLE children ADD COLUMN gender TEXT CHECK (gender IN ('boy', 'girl', 'other'));
    END IF;
    
    -- Add birth measurements if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'children' AND column_name = 'birth_height_cm') THEN
        ALTER TABLE children ADD COLUMN birth_height_cm DECIMAL(5,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'children' AND column_name = 'birth_weight_grams') THEN
        ALTER TABLE children ADD COLUMN birth_weight_grams DECIMAL(7,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'children' AND column_name = 'head_circumference_cm') THEN
        ALTER TABLE children ADD COLUMN head_circumference_cm DECIMAL(5,2);
    END IF;
    
    -- Add feeding and birth info if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'children' AND column_name = 'feeding_method') THEN
        ALTER TABLE children ADD COLUMN feeding_method TEXT CHECK (feeding_method IN ('breastfeeding', 'bottle', 'mixed'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'children' AND column_name = 'birth_type') THEN
        ALTER TABLE children ADD COLUMN birth_type TEXT CHECK (birth_type IN ('vaginal', 'c-section'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'children' AND column_name = 'family_id') THEN
        ALTER TABLE children ADD COLUMN family_id UUID;
    END IF;
END $$;

-- Add metadata column to checklist_items if missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'checklist_items' AND column_name = 'metadata') THEN
        ALTER TABLE checklist_items ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- Create missing tables only if they don't exist
-- Chat sessions
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

-- Enable RLS on new tables only
DO $$ 
BEGIN
    -- Enable RLS if not already enabled
    ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE tracker_entries ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Drop existing policies before recreating (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Recreate policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for new tables (using IF NOT EXISTS pattern)
DO $$ 
BEGIN
    -- Chat sessions policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_sessions' AND policyname = 'Users can view own chat sessions') THEN
        CREATE POLICY "Users can view own chat sessions" ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_sessions' AND policyname = 'Users can insert own chat sessions') THEN
        CREATE POLICY "Users can insert own chat sessions" ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_sessions' AND policyname = 'Users can update own chat sessions') THEN
        CREATE POLICY "Users can update own chat sessions" ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    -- Chat messages policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users can view messages from their sessions') THEN
        CREATE POLICY "Users can view messages from their sessions" ON chat_messages FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()
          )
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users can insert messages to their sessions') THEN
        CREATE POLICY "Users can insert messages to their sessions" ON chat_messages FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()
          )
        );
    END IF;
    
    -- Subscription policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can view own subscription') THEN
        CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    -- Tracker entries policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tracker_entries' AND policyname = 'Users can view own tracker entries') THEN
        CREATE POLICY "Users can view own tracker entries" ON tracker_entries FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tracker_entries' AND policyname = 'Users can insert own tracker entries') THEN
        CREATE POLICY "Users can insert own tracker entries" ON tracker_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tracker_entries' AND policyname = 'Users can update own tracker entries') THEN
        CREATE POLICY "Users can update own tracker entries" ON tracker_entries FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tracker_entries' AND policyname = 'Users can delete own tracker entries') THEN
        CREATE POLICY "Users can delete own tracker entries" ON tracker_entries FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create or replace functions
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

-- Create trigger if not exists
DROP TRIGGER IF EXISTS onboarding_completion_trigger ON children;
CREATE TRIGGER onboarding_completion_trigger
  AFTER INSERT ON children
  FOR EACH ROW
  EXECUTE FUNCTION mark_onboarding_complete();

-- Insert subscription plans (update if exists)
INSERT INTO subscription_plans (id, name, tier, price_aud, features, popular, trial_days) VALUES 
('free', 'Free', 'free', 0, '["2 children profiles", "Activity tracking", "Basic analytics", "Limited AI chat"]', false, 0),
('premium_monthly', 'Premium', 'premium', 999, '["Unlimited children profiles", "Activity tracking", "Advanced analytics", "Unlimited AI chat", "Google Calendar sync", "Data export", "Priority support"]', true, 7)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_aud = EXCLUDED.price_aud,
  features = EXCLUDED.features,
  popular = EXCLUDED.popular,
  trial_days = EXCLUDED.trial_days;

-- Create default subscriptions for existing users without one
INSERT INTO subscriptions (user_id, tier, status)
SELECT id, 'free', 'active' FROM auth.users
WHERE id NOT IN (SELECT user_id FROM subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- Create indexes if they don't exist
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
  RAISE NOTICE 'PAM safe migration complete! All missing columns and tables have been added.';
END $$;