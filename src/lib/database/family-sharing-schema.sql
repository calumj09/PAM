-- Family Sharing Schema for PAM
-- Enables multiple users to share access to children's data

-- Family groups - represents a family unit
CREATE TABLE family_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family members - users who belong to a family group
CREATE TABLE family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'partner', 'caregiver', 'grandparent')),
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),
  
  UNIQUE(family_id, user_id)
);

-- Family invitations - pending invites to join a family
CREATE TABLE family_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('partner', 'caregiver', 'grandparent')),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(family_id, email)
);

-- Update children table to include family_id
ALTER TABLE children 
ADD COLUMN family_id UUID REFERENCES family_groups(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_invitations_token ON family_invitations(token);
CREATE INDEX idx_children_family_id ON children(family_id);

-- Row Level Security Policies

-- Family Groups RLS
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view family groups they belong to" ON family_groups
  FOR SELECT USING (
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create family groups" ON family_groups
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Family owners can update their groups" ON family_groups
  FOR UPDATE USING (
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Family Members RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view family members in their families" ON family_members
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family owners can manage members" ON family_members
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Users can leave families" ON family_members
  FOR DELETE USING (user_id = auth.uid());

-- Family Invitations RLS
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invitations for their families" ON family_invitations
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'partner')
    )
  );

CREATE POLICY "Family owners can manage invitations" ON family_invitations
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Update Children RLS to include family sharing
DROP POLICY IF EXISTS "Users can only see their own children" ON children;
DROP POLICY IF EXISTS "Users can only insert their own children" ON children;
DROP POLICY IF EXISTS "Users can only update their own children" ON children;
DROP POLICY IF EXISTS "Users can only delete their own children" ON children;

CREATE POLICY "Users can view children in their families" ON children
  FOR SELECT USING (
    user_id = auth.uid() OR 
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create children in their families" ON children
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND (
      family_id IS NULL OR 
      family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'partner')
      )
    )
  );

CREATE POLICY "Users can update children in their families" ON children
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'partner')
    )
  );

CREATE POLICY "Users can delete their own children" ON children
  FOR DELETE USING (user_id = auth.uid());

-- Update other tables to support family sharing
-- Activities
DROP POLICY IF EXISTS "Users can only see their own activities" ON activities;
DROP POLICY IF EXISTS "Users can only insert their own activities" ON activities;
DROP POLICY IF EXISTS "Users can only update their own activities" ON activities;
DROP POLICY IF EXISTS "Users can only delete their own activities" ON activities;

CREATE POLICY "Users can view activities for children in their families" ON activities
  FOR SELECT USING (
    user_id = auth.uid() OR 
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create activities for children in their families" ON activities
  FOR INSERT WITH CHECK (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update activities for children in their families" ON activities
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete activities for children in their families" ON activities
  FOR DELETE USING (
    user_id = auth.uid() OR 
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() OR family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Functions for family management
CREATE OR REPLACE FUNCTION create_family_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a default family group for new users
  INSERT INTO family_groups (name, created_by)
  VALUES (CONCAT(NEW.email, '''s Family'), NEW.id);
  
  -- Add user as owner of their family
  INSERT INTO family_members (family_id, user_id, role, added_by)
  VALUES (
    (SELECT id FROM family_groups WHERE created_by = NEW.id LIMIT 1),
    NEW.id,
    'owner',
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create family on user signup
CREATE OR REPLACE TRIGGER create_family_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_family_for_user();

-- Function to accept family invitation
CREATE OR REPLACE FUNCTION accept_family_invitation(invitation_token TEXT)
RETURNS JSON AS $$
DECLARE
  invitation family_invitations%ROWTYPE;
  family_name TEXT;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation 
  FROM family_invitations 
  WHERE token = invitation_token 
    AND expires_at > NOW() 
    AND accepted_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Check if user is already in this family
  IF EXISTS (
    SELECT 1 FROM family_members 
    WHERE family_id = invitation.family_id AND user_id = auth.uid()
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Already a member of this family');
  END IF;
  
  -- Add user to family
  INSERT INTO family_members (family_id, user_id, role, added_by)
  VALUES (invitation.family_id, auth.uid(), invitation.role, invitation.invited_by);
  
  -- Mark invitation as accepted
  UPDATE family_invitations 
  SET accepted_at = NOW(), accepted_by = auth.uid()
  WHERE id = invitation.id;
  
  -- Get family name for response
  SELECT name INTO family_name FROM family_groups WHERE id = invitation.family_id;
  
  RETURN json_build_object(
    'success', true, 
    'family_name', family_name,
    'role', invitation.role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;