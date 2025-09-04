-- User Management System for Talent Management Platform
-- Adds RBAC with talent-scoped permissions and invitation system

-- Create talents table (rename/extend actors concept)
CREATE TABLE IF NOT EXISTS talents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  categories TEXT[] DEFAULT '{}'::TEXT[], -- e.g., {Actor,Singer,Entrepreneur,Influencer}
  languages TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create memberships table for RBAC (user-talent-role mapping)
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  talent_id UUID NULL REFERENCES talents(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN (
    'owner','admin','manager','editor','approver','analyst','viewer','guest','talent','freelancer','client','bot'
  )),
  expires_at TIMESTAMPTZ NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create invites table for email-based invitations
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  talent_id UUID NULL REFERENCES talents(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN (
    'owner','admin','manager','editor','approver','analyst','viewer','guest','talent','freelancer','client'
  )),
  invited_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL CHECK (status IN ('pending','accepted','expired','revoked')) DEFAULT 'pending',
  token TEXT, -- optional for future magic-link
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_talent ON memberships(talent_id);
CREATE INDEX IF NOT EXISTS idx_memberships_role ON memberships(role);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);

-- Create compatibility view for existing actors table references
CREATE OR REPLACE VIEW actors AS 
SELECT 
  id, 
  name, 
  avatar, 
  bio, 
  languages,
  categories[1] as category, -- backward compatibility for single category
  created_at
FROM talents;

-- Function to get effective role for a user and talent
CREATE OR REPLACE FUNCTION get_effective_role(p_user_id UUID, p_talent_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  role_weights JSONB := '{
    "owner": 100,
    "admin": 90,
    "manager": 80,
    "editor": 70,
    "approver": 60,
    "analyst": 50,
    "viewer": 40,
    "guest": 30,
    "talent": 20,
    "freelancer": 15,
    "client": 10,
    "bot": 5
  }';
  max_weight INTEGER := 0;
  effective_role TEXT := 'guest';
  membership_role TEXT;
BEGIN
  -- Get all applicable memberships for the user
  FOR membership_role IN
    SELECT role 
    FROM memberships 
    WHERE user_id = p_user_id 
      AND (talent_id IS NULL OR talent_id = p_talent_id)
      AND (expires_at IS NULL OR expires_at > NOW())
  LOOP
    -- Check if this role has higher weight
    IF (role_weights->>membership_role)::INTEGER > max_weight THEN
      max_weight := (role_weights->>membership_role)::INTEGER;
      effective_role := membership_role;
    END IF;
  END LOOP;
  
  RETURN effective_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_talents_updated_at BEFORE UPDATE ON talents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invites_updated_at BEFORE UPDATE ON invites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
