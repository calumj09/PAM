# PAM Tracker Setup Instructions

The PAM tracker functionality has been updated to work with a simplified database schema that's easier to implement and maintain.

## Database Setup

### Option 1: Simple Schema (Recommended)

Run the following SQL in your Supabase SQL editor:

```sql
-- Simple activities table that combines all activity data
CREATE TABLE IF NOT EXISTS simple_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'feeding', 'sleep', 'diaper', 'growth', 'note'
  activity_subtype TEXT, -- 'breast', 'bottle', 'solid' for feeding; 'wet', 'dirty' for diaper
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Feeding specific fields
  amount_ml INTEGER,
  breast_side TEXT, -- 'left', 'right', 'both'
  food_items TEXT[], -- for solid foods
  
  -- Sleep specific fields
  sleep_quality TEXT, -- 'excellent', 'good', 'fair', 'poor'
  wake_up_mood TEXT, -- 'happy', 'cranky', 'calm'
  sleep_location TEXT, -- 'crib', 'bed', 'stroller', 'car'
  
  -- Diaper specific fields
  diaper_consistency TEXT, -- 'liquid', 'soft', 'normal', 'hard'
  diaper_color TEXT,
  rash_present BOOLEAN DEFAULT FALSE,
  
  -- Growth specific fields
  weight_grams INTEGER,
  height_cm NUMERIC(5,2),
  head_circumference_cm NUMERIC(4,1),
  
  -- General fields
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_simple_activities_child_date 
ON simple_activities(child_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_simple_activities_type 
ON simple_activities(child_id, activity_type, started_at DESC);

-- Enable RLS
ALTER TABLE simple_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their children's activities" 
ON simple_activities FOR SELECT 
USING (
  child_id IN (
    SELECT id FROM children WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert activities for their children" 
ON simple_activities FOR INSERT 
WITH CHECK (
  child_id IN (
    SELECT id FROM children WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their children's activities" 
ON simple_activities FOR UPDATE 
USING (
  child_id IN (
    SELECT id FROM children WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their children's activities" 
ON simple_activities FOR DELETE 
USING (
  child_id IN (
    SELECT id FROM children WHERE user_id = auth.uid()
  )
);
```

### Testing the Setup

1. **Add a child** through the PAM app (Dashboard > Children > Add Child)
2. **Go to the Tracker page** and try the "15 min feed" button
3. **Test voice input** by clicking the microphone and saying "Breastfeed for 15 minutes"

## Features Fixed

### 1. Voice Notes Working ✅
- Added proper microphone permission handling
- Improved error messages and browser compatibility
- Enhanced voice recognition with Australian English support

### 2. 15 Min Feed Saving ✅
- Updated TrackerService to work with simplified database schema
- Added fallback mechanisms for different database setups
- Improved error handling and user feedback

## Voice Commands Supported

The voice input now supports these commands:

**Feeding:**
- "Breastfeed for 15 minutes"
- "Bottle feed 120ml"
- "Solid food banana and rice"

**Diaper Changes:**
- "Wet diaper"
- "Dirty diaper"

**Sleep:**
- "Start sleep"
- "End sleep"

**Other:**
- "Tummy time for 10 minutes"

## Troubleshooting

### Voice Input Not Working
1. **Check browser support**: Voice input works best in Chrome/Edge
2. **Allow microphone access**: Click "Allow" when prompted for microphone permission
3. **Check microphone**: Ensure your microphone is working and not muted
4. **Try refresh**: Refresh the page and try again

### 15 Min Feed Not Saving
1. **Check database**: Ensure the `simple_activities` table exists
2. **Check child**: Ensure you have added a child profile
3. **Check console**: Open browser dev tools (F12) and check for error messages
4. **Try manual entry**: If quick buttons don't work, try voice input

### Database Errors
If you see database errors:
1. **Run the SQL above** in your Supabase SQL editor
2. **Check RLS policies** are enabled
3. **Verify children table** exists and has proper structure

## Development Notes

The tracker service now uses a dual-approach:
1. **Primary**: Simple schema (`simple_activities` table)
2. **Fallback**: Complex schema (original multi-table structure)

This ensures the tracker works regardless of which database setup you have, making it more robust and easier to deploy.