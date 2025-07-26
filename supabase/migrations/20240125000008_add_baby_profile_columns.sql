-- Add detailed baby profile columns for onboarding
ALTER TABLE children ADD COLUMN IF NOT EXISTS is_due_date BOOLEAN DEFAULT FALSE;
ALTER TABLE children ADD COLUMN IF NOT EXISTS baby_type TEXT CHECK (baby_type IN ('single', 'twins'));
ALTER TABLE children ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('boy', 'girl', 'other'));
ALTER TABLE children ADD COLUMN IF NOT EXISTS birth_height_cm DECIMAL(5,2);
ALTER TABLE children ADD COLUMN IF NOT EXISTS birth_weight_grams DECIMAL(7,2);
ALTER TABLE children ADD COLUMN IF NOT EXISTS head_circumference_cm DECIMAL(5,2);
ALTER TABLE children ADD COLUMN IF NOT EXISTS feeding_method TEXT CHECK (feeding_method IN ('breastfeeding', 'bottle', 'mixed'));
ALTER TABLE children ADD COLUMN IF NOT EXISTS birth_type TEXT CHECK (birth_type IN ('vaginal', 'c-section'));
ALTER TABLE children ADD COLUMN IF NOT EXISTS family_id UUID;

-- Add updated_at column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update the profiles table to include more onboarding fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Create a function to automatically set onboarding_completed when a child is added
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

-- Create trigger to automatically mark onboarding complete when first child is added
DROP TRIGGER IF EXISTS onboarding_completion_trigger ON children;
CREATE TRIGGER onboarding_completion_trigger
  AFTER INSERT ON children
  FOR EACH ROW
  EXECUTE FUNCTION mark_onboarding_complete();