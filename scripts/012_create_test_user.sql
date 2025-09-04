-- Create test user account for login testing
-- This script creates a test user in Supabase Auth and corresponding profile

-- Insert test user into auth.users (this requires admin privileges)
-- Note: In production, users should sign up through the normal flow
-- This is for testing purposes only

-- Create a test profile that will be linked to the auth user
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  avatar_url,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@talenthub.com',
  'Admin User',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'admin',
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  role = EXCLUDED.role,
  updated_at = now();

-- Note: The actual auth user creation needs to be done through Supabase Auth API
-- or by having the user sign up through the signup page
