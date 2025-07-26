-- Push Notifications Schema for PAM

-- Notification preferences for users
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  checklist_reminders_enabled BOOLEAN DEFAULT TRUE,
  reminder_days_before INTEGER DEFAULT 1, -- Days before due date
  reminder_time TIME DEFAULT '09:00:00', -- Time of day to send reminders
  push_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push tokens for FCM
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  token TEXT NOT NULL UNIQUE,
  platform TEXT CHECK (platform IN ('android', 'ios', 'web')) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification queue for scheduled notifications
CREATE TABLE scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  checklist_item_id UUID REFERENCES checklist_items,
  notification_type TEXT CHECK (notification_type IN ('checklist_reminder', 'immunization_due', 'appointment_reminder')) NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_active ON push_tokens(is_active);
CREATE INDEX idx_scheduled_notifications_user_id ON scheduled_notifications(user_id);
CREATE INDEX idx_scheduled_notifications_scheduled_for ON scheduled_notifications(scheduled_for);
CREATE INDEX idx_scheduled_notifications_pending ON scheduled_notifications(is_sent, scheduled_for);

-- Enable Row Level Security
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own notification preferences" ON notification_preferences 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own push tokens" ON push_tokens 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own scheduled notifications" ON scheduled_notifications 
  FOR SELECT USING (auth.uid() = user_id);

-- Function to automatically create notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default preferences when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_notification_preferences();

-- Function to schedule checklist notifications
CREATE OR REPLACE FUNCTION schedule_checklist_notification(
  p_checklist_item_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_body TEXT,
  p_due_date DATE
)
RETURNS VOID AS $$
DECLARE
  v_preferences notification_preferences%ROWTYPE;
  v_scheduled_datetime TIMESTAMPTZ;
BEGIN
  -- Get user's notification preferences
  SELECT * INTO v_preferences 
  FROM notification_preferences 
  WHERE user_id = p_user_id;
  
  -- Skip if user has disabled checklist reminders
  IF NOT v_preferences.checklist_reminders_enabled OR NOT v_preferences.push_enabled THEN
    RETURN;
  END IF;
  
  -- Calculate notification datetime (X days before due date at preferred time)
  v_scheduled_datetime := (p_due_date - INTERVAL '1 day' * v_preferences.reminder_days_before) + v_preferences.reminder_time;
  
  -- Only schedule if it's in the future
  IF v_scheduled_datetime > NOW() THEN
    INSERT INTO scheduled_notifications (
      user_id,
      checklist_item_id,
      notification_type,
      title,
      body,
      scheduled_for
    ) VALUES (
      p_user_id,
      p_checklist_item_id,
      'checklist_reminder',
      p_title,
      p_body,
      v_scheduled_datetime
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to cancel scheduled notification for a checklist item
CREATE OR REPLACE FUNCTION cancel_checklist_notification(p_checklist_item_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM scheduled_notifications 
  WHERE checklist_item_id = p_checklist_item_id AND is_sent = FALSE;
END;
$$ LANGUAGE plpgsql;