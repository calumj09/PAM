-- Google Calendar Integration Schema for PAM

-- Calendar integrations for users
CREATE TABLE calendar_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  google_access_token TEXT NOT NULL,
  google_refresh_token TEXT NOT NULL,
  google_email TEXT NOT NULL,
  calendar_id TEXT NOT NULL,
  calendar_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sync_enabled BOOLEAN DEFAULT TRUE,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one active integration per user
  UNIQUE(user_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Calendar sync settings for users
CREATE TABLE calendar_sync_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  auto_create_events BOOLEAN DEFAULT TRUE,
  default_event_duration INTEGER DEFAULT 60, -- minutes
  reminder_minutes_before INTEGER[] DEFAULT ARRAY[1440, 60], -- 1 day, 1 hour
  default_location TEXT,
  include_categories TEXT[] DEFAULT ARRAY['immunization', 'registration', 'checkup'], -- milestone is optional
  event_color_id INTEGER DEFAULT 11, -- Red for medical/important
  sync_past_events BOOLEAN DEFAULT FALSE,
  sync_future_days INTEGER DEFAULT 365, -- Sync 1 year ahead
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track synced calendar events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  checklist_item_id UUID REFERENCES checklist_items NOT NULL,
  google_event_id TEXT NOT NULL,
  calendar_id TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_start_time TIMESTAMPTZ NOT NULL,
  event_end_time TIMESTAMPTZ NOT NULL,
  is_synced BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicate events
  UNIQUE(checklist_item_id, google_event_id)
);

-- Premium subscription status (simplified for now)
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  plan_type TEXT CHECK (plan_type IN ('free', 'premium')) DEFAULT 'free',
  is_active BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_calendar_integrations_user_id ON calendar_integrations(user_id);
CREATE INDEX idx_calendar_integrations_active ON calendar_integrations(user_id, is_active);
CREATE INDEX idx_calendar_sync_settings_user_id ON calendar_sync_settings(user_id);
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_checklist_item ON calendar_events(checklist_item_id);
CREATE INDEX idx_calendar_events_synced ON calendar_events(is_synced, last_synced_at);
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_active ON user_subscriptions(is_active, expires_at);

-- Enable Row Level Security
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own calendar integrations" ON calendar_integrations 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own calendar sync settings" ON calendar_sync_settings 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own calendar events" ON calendar_events 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscription" ON user_subscriptions 
  FOR SELECT USING (auth.uid() = user_id);

-- Function to check premium status
CREATE OR REPLACE FUNCTION is_premium_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_subscriptions 
    WHERE user_id = p_user_id 
    AND plan_type = 'premium' 
    AND is_active = TRUE 
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create default calendar sync settings
CREATE OR REPLACE FUNCTION create_default_calendar_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO calendar_sync_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO user_subscriptions (user_id, plan_type, is_active)
  VALUES (NEW.id, 'free', FALSE)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default settings when user signs up
CREATE TRIGGER on_auth_user_created_calendar
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_calendar_settings();

-- Function to sync checklist item to calendar
CREATE OR REPLACE FUNCTION sync_checklist_to_calendar(
  p_checklist_item_id UUID,
  p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_integration calendar_integrations%ROWTYPE;
  v_settings calendar_sync_settings%ROWTYPE;
  v_checklist_item checklist_items%ROWTYPE;
  v_child children%ROWTYPE;
BEGIN
  -- Check if user is premium
  IF NOT is_premium_user(p_user_id) THEN
    RETURN;
  END IF;
  
  -- Get active calendar integration
  SELECT * INTO v_integration 
  FROM calendar_integrations 
  WHERE user_id = p_user_id AND is_active = TRUE AND sync_enabled = TRUE;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Get sync settings
  SELECT * INTO v_settings 
  FROM calendar_sync_settings 
  WHERE user_id = p_user_id;
  
  IF NOT FOUND OR NOT v_settings.auto_create_events THEN
    RETURN;
  END IF;
  
  -- Get checklist item
  SELECT * INTO v_checklist_item 
  FROM checklist_items 
  WHERE id = p_checklist_item_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check if category should be synced
  IF NOT (v_checklist_item.category = ANY(v_settings.include_categories)) THEN
    RETURN;
  END IF;
  
  -- Get child information
  SELECT * INTO v_child 
  FROM children 
  WHERE id = v_checklist_item.child_id;
  
  -- Here we would call the calendar API to create the event
  -- For now, we'll just log that sync should happen
  -- The actual API call will be handled by the application layer
  
  RAISE NOTICE 'Calendar sync needed for checklist item % (child: %)', 
    v_checklist_item.title, v_child.name;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up calendar events when checklist items are deleted
CREATE OR REPLACE FUNCTION cleanup_calendar_events()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark calendar events as not synced when checklist item is deleted
  UPDATE calendar_events 
  SET is_synced = FALSE, updated_at = NOW()
  WHERE checklist_item_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to cleanup calendar events
CREATE TRIGGER on_checklist_item_deleted
  AFTER DELETE ON checklist_items
  FOR EACH ROW EXECUTE FUNCTION cleanup_calendar_events();

-- Function to update calendar sync timestamp
CREATE OR REPLACE FUNCTION update_calendar_sync_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update timestamps
CREATE TRIGGER update_calendar_integrations_timestamp
  BEFORE UPDATE ON calendar_integrations
  FOR EACH ROW EXECUTE FUNCTION update_calendar_sync_timestamp();

CREATE TRIGGER update_calendar_sync_settings_timestamp
  BEFORE UPDATE ON calendar_sync_settings
  FOR EACH ROW EXECUTE FUNCTION update_calendar_sync_timestamp();

CREATE TRIGGER update_calendar_events_timestamp
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_calendar_sync_timestamp();

CREATE TRIGGER update_user_subscriptions_timestamp
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_calendar_sync_timestamp();