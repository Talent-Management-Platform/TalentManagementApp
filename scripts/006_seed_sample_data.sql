-- Insert sample data for development and testing
-- Note: This will only work after users are created and authenticated

-- Sample actors (will be inserted via the application after user signup)
-- This is just a reference for the data structure

-- Sample tasks
-- INSERT INTO public.tasks (user_id, actor_id, title, description, type, status, priority, due_date)
-- VALUES 
--   (auth.uid(), (SELECT id FROM public.actors WHERE user_id = auth.uid() LIMIT 1), 'Podcast Interview with Tech Talk', 'Discuss entrepreneurship journey and latest ventures', 'podcast', 'pending', 'high', NOW() + INTERVAL '7 days'),
--   (auth.uid(), (SELECT id FROM public.actors WHERE user_id = auth.uid() LIMIT 1), 'Instagram Story Campaign', 'Behind-the-scenes content for new project launch', 'social_media', 'in_progress', 'medium', NOW() + INTERVAL '3 days'),
--   (auth.uid(), (SELECT id FROM public.actors WHERE user_id = auth.uid() LIMIT 1), 'Forbes Article Feature', 'Interview about industry trends and predictions', 'article', 'completed', 'high', NOW() - INTERVAL '2 days');

-- Sample PR items
-- INSERT INTO public.pr_items (user_id, actor_id, title, description, type, url, publication, published_date, reach_estimate, sentiment)
-- VALUES 
--   (auth.uid(), (SELECT id FROM public.actors WHERE user_id = auth.uid() LIMIT 1), 'Rising Star in Tech Industry', 'Feature article about innovative approach to business', 'article', 'https://example.com/article1', 'TechCrunch', NOW() - INTERVAL '5 days', 50000, 'positive'),
--   (auth.uid(), (SELECT id FROM public.actors WHERE user_id = auth.uid() LIMIT 1), 'Entrepreneurship Podcast Episode', 'Discussion about startup challenges and success strategies', 'podcast', 'https://example.com/podcast1', 'Startup Stories', NOW() - INTERVAL '10 days', 25000, 'positive');

-- Sample analytics data
-- INSERT INTO public.analytics (user_id, actor_id, metric_type, metric_value, metric_date, platform)
-- VALUES 
--   (auth.uid(), (SELECT id FROM public.actors WHERE user_id = auth.uid() LIMIT 1), 'social_followers', 15000, CURRENT_DATE - INTERVAL '1 day', 'instagram'),
--   (auth.uid(), (SELECT id FROM public.actors WHERE user_id = auth.uid() LIMIT 1), 'social_followers', 8500, CURRENT_DATE - INTERVAL '1 day', 'twitter'),
--   (auth.uid(), (SELECT id FROM public.actors WHERE user_id = auth.uid() LIMIT 1), 'engagement_rate', 4.2, CURRENT_DATE - INTERVAL '1 day', 'instagram'),
--   (auth.uid(), (SELECT id FROM public.actors WHERE user_id = auth.uid() LIMIT 1), 'media_mentions', 12, CURRENT_DATE - INTERVAL '1 day', NULL);

-- Create a function to generate sample data for a user
CREATE OR REPLACE FUNCTION generate_sample_data_for_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY definer
AS $$
DECLARE
  sample_actor_id UUID;
BEGIN
  -- Insert a sample actor
  INSERT INTO public.actors (user_id, name, stage_name, bio, category, contact_email, social_media)
  VALUES (
    target_user_id,
    'John Entrepreneur',
    'JohnE',
    'Innovative entrepreneur focused on sustainable technology solutions',
    'entrepreneur',
    'john@example.com',
    '{"instagram": "@johne", "twitter": "@john_entrepreneur", "linkedin": "john-entrepreneur"}'
  )
  RETURNING id INTO sample_actor_id;

  -- Insert sample tasks
  INSERT INTO public.tasks (user_id, actor_id, title, description, type, status, priority, due_date)
  VALUES 
    (target_user_id, sample_actor_id, 'Podcast Interview with Tech Talk', 'Discuss entrepreneurship journey and latest ventures', 'podcast', 'pending', 'high', NOW() + INTERVAL '7 days'),
    (target_user_id, sample_actor_id, 'Instagram Story Campaign', 'Behind-the-scenes content for new project launch', 'social_media', 'in_progress', 'medium', NOW() + INTERVAL '3 days'),
    (target_user_id, sample_actor_id, 'Forbes Article Feature', 'Interview about industry trends and predictions', 'article', 'completed', 'high', NOW() - INTERVAL '2 days');

  -- Insert sample PR items
  INSERT INTO public.pr_items (user_id, actor_id, title, description, type, url, publication, published_date, reach_estimate, sentiment)
  VALUES 
    (target_user_id, sample_actor_id, 'Rising Star in Tech Industry', 'Feature article about innovative approach to business', 'article', 'https://example.com/article1', 'TechCrunch', NOW() - INTERVAL '5 days', 50000, 'positive'),
    (target_user_id, sample_actor_id, 'Entrepreneurship Podcast Episode', 'Discussion about startup challenges and success strategies', 'podcast', 'https://example.com/podcast1', 'Startup Stories', NOW() - INTERVAL '10 days', 25000, 'positive');

  -- Insert sample analytics
  INSERT INTO public.analytics (user_id, actor_id, metric_type, metric_value, metric_date, platform)
  VALUES 
    (target_user_id, sample_actor_id, 'social_followers', 15000, CURRENT_DATE - INTERVAL '1 day', 'instagram'),
    (target_user_id, sample_actor_id, 'social_followers', 8500, CURRENT_DATE - INTERVAL '1 day', 'twitter'),
    (target_user_id, sample_actor_id, 'engagement_rate', 4.2, CURRENT_DATE - INTERVAL '1 day', 'instagram'),
    (target_user_id, sample_actor_id, 'media_mentions', 12, CURRENT_DATE - INTERVAL '1 day', NULL);
END;
$$;
