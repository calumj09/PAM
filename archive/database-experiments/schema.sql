-- Users extended profile
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  state_territory TEXT,
  postcode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Children profiles
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  is_premium_feature BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist items
CREATE TABLE checklist_items (
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own children" ON children FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own children" ON children FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own children" ON children FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own children" ON children FOR DELETE USING (auth.uid() = user_id);

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