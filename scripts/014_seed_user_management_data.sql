-- Seed data for User Management System
-- Creates sample users, talents, and memberships for testing

-- Insert sample talents (migrate existing actors data if needed)
INSERT INTO talents (id, name, categories, languages, bio) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Sunit Morarjee', 
   '{Actor,Entrepreneur}', '{English,Hindi,Gujarati,Marathi}',
   'Versatile actor and entrepreneur with experience in multiple languages and industries.'),
  ('00000000-0000-0000-0000-000000000002', 'Aarya Kapoor', 
   '{Actor,Influencer}', '{English,Hindi}',
   'Rising star in the entertainment industry with a strong social media presence.'),
  ('00000000-0000-0000-0000-000000000003', 'Priya Sharma', 
   '{Singer,Musician}', '{English,Hindi,Punjabi}',
   'Professional singer and musician specializing in Bollywood and contemporary music.'),
  ('00000000-0000-0000-0000-000000000004', 'Raj Patel', 
   '{Entrepreneur,Influencer}', '{English,Hindi,Gujarati}',
   'Tech entrepreneur and business influencer focused on startup ecosystem.')
ON CONFLICT (id) DO NOTHING;

-- Function to create sample memberships (will be called after users are created via auth)
CREATE OR REPLACE FUNCTION create_sample_memberships()
RETURNS VOID AS $$
DECLARE
  owner_user_id UUID;
  manager_user_id UUID;
  editor_user_id UUID;
  talent_user_id UUID;
BEGIN
  -- Get user IDs from profiles table (assuming they exist)
  SELECT id INTO owner_user_id FROM auth.users WHERE email = 'admin@test.com' LIMIT 1;
  
  -- Create sample memberships if users exist
  IF owner_user_id IS NOT NULL THEN
    -- Owner has org-wide access
    INSERT INTO memberships (user_id, talent_id, role) VALUES
      (owner_user_id, NULL, 'owner')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Create sample invites for demonstration
  INSERT INTO invites (email, talent_id, role, invited_by, status) VALUES
    ('manager@example.com', '00000000-0000-0000-0000-000000000001', 'manager', owner_user_id, 'pending'),
    ('editor@example.com', '00000000-0000-0000-0000-000000000001', 'editor', owner_user_id, 'pending'),
    ('analyst@example.com', NULL, 'analyst', owner_user_id, 'pending'),
    ('talent@example.com', '00000000-0000-0000-0000-000000000001', 'talent', owner_user_id, 'pending')
  ON CONFLICT DO NOTHING;
  
END;
$$ LANGUAGE plpgsql;

-- Call the function to create sample data
SELECT create_sample_memberships();

-- Create some sample role assignments for existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Assign roles to existing users in profiles table
  FOR user_record IN SELECT id FROM auth.users LIMIT 5 LOOP
    INSERT INTO memberships (user_id, talent_id, role) VALUES
      (user_record.id, '00000000-0000-0000-0000-000000000001', 'viewer')
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
