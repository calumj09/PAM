-- Create user_profiles table for premium status and AI usage tracking
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_premium BOOLEAN DEFAULT FALSE,
  ai_questions_used INTEGER DEFAULT 0,
  ai_questions_limit INTEGER DEFAULT 5,
  premium_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create ai_interactions table for logging AI conversations
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS user_profiles_is_premium_idx ON user_profiles(is_premium);
CREATE INDEX IF NOT EXISTS ai_interactions_user_id_idx ON ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS ai_interactions_created_at_idx ON ai_interactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for ai_interactions
CREATE POLICY "Users can view own AI interactions" ON ai_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI interactions" ON ai_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to automatically update updated_at for user_profiles
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to reset AI questions monthly (for non-premium users)
CREATE OR REPLACE FUNCTION reset_monthly_ai_questions()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles 
  SET ai_questions_used = 0
  WHERE is_premium = FALSE 
    AND DATE_TRUNC('month', updated_at) < DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql;