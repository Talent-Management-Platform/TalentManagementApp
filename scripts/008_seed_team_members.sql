-- Create a function to generate sample team members for a user
CREATE OR REPLACE FUNCTION generate_sample_team_members(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY definer
AS $$
DECLARE
  pm_id UUID;
  content_id UUID;
  social_id UUID;
  pr_id UUID;
  sample_task_id UUID;
BEGIN
  -- Insert sample team members
  INSERT INTO public.team_members (user_id, name, email, role, department, skills, status, hire_date)
  VALUES 
    (target_user_id, 'Sarah Johnson', 'sarah@company.com', 'project_manager', 'Operations', ARRAY['project management', 'team coordination', 'client relations'], 'active', '2023-01-15'),
    (target_user_id, 'Mike Chen', 'mike@company.com', 'content_creator', 'Creative', ARRAY['writing', 'video editing', 'storytelling'], 'active', '2023-03-20'),
    (target_user_id, 'Emma Rodriguez', 'emma@company.com', 'social_media_manager', 'Marketing', ARRAY['social media', 'community management', 'analytics'], 'active', '2023-02-10'),
    (target_user_id, 'David Kim', 'david@company.com', 'pr_specialist', 'Marketing', ARRAY['media relations', 'press releases', 'crisis management'], 'active', '2023-04-05'),
    (target_user_id, 'Lisa Thompson', 'lisa@company.com', 'designer', 'Creative', ARRAY['graphic design', 'branding', 'UI/UX'], 'active', '2023-01-30')
  RETURNING id INTO pm_id;

  -- Get the IDs of the inserted team members for assignments
  SELECT id INTO pm_id FROM public.team_members WHERE user_id = target_user_id AND email = 'sarah@company.com';
  SELECT id INTO content_id FROM public.team_members WHERE user_id = target_user_id AND email = 'mike@company.com';
  SELECT id INTO social_id FROM public.team_members WHERE user_id = target_user_id AND email = 'emma@company.com';
  SELECT id INTO pr_id FROM public.team_members WHERE user_id = target_user_id AND email = 'david@company.com';

  -- Get a sample task ID to create assignments
  SELECT id INTO sample_task_id FROM public.tasks WHERE user_id = target_user_id LIMIT 1;

  -- Insert sample task assignments if we have a task
  IF sample_task_id IS NOT NULL THEN
    INSERT INTO public.task_assignments (task_id, team_member_id, assigned_by, role_in_task, estimated_hours)
    VALUES 
      (sample_task_id, pm_id, target_user_id, 'lead', 8),
      (sample_task_id, content_id, target_user_id, 'contributor', 12),
      (sample_task_id, social_id, target_user_id, 'contributor', 6);
  END IF;
END;
$$;
