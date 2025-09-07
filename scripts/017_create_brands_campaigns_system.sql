-- Brands and Campaigns System Database Schema
-- This script creates the complete database structure for managing brands and campaigns

-- Brands are like Talents (managed entities)
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  logo text,
  bio text,
  website text,
  categories text[] DEFAULT '{}'::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for brands
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- RLS policies for brands
CREATE POLICY "Users can view their own brands" ON brands
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brands" ON brands
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brands" ON brands
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brands" ON brands
  FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_categories ON brands USING GIN(categories);

-- Campaigns (projects under a Talent or Brand)
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_kind text CHECK (owner_kind IN ('talent','brand')) NOT NULL,
  owner_id uuid NOT NULL,
  title text NOT NULL,
  vision text,
  strategy text,
  status text CHECK (status IN ('planning','active','on_hold','completed','cancelled')) DEFAULT 'planning',
  priority text CHECK (priority IN ('low','medium','high','critical')) DEFAULT 'medium',
  start_date date,
  end_date date,
  budget_currency text DEFAULT 'USD',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaigns
CREATE POLICY "Users can view their own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" ON campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_owner ON campaigns(owner_kind, owner_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- Campaign team & POCs
CREATE TABLE IF NOT EXISTS campaign_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  role text,
  user_name text,
  email text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for campaign_members
ALTER TABLE campaign_members ENABLE ROW LEVEL SECURITY;

-- RLS policy for campaign_members (inherit from campaign)
CREATE POLICY "Users can manage campaign members for their campaigns" ON campaign_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_members.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_campaign_members_campaign ON campaign_members(campaign_id);

-- Campaign tasks
CREATE TABLE IF NOT EXISTS campaign_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assignee text,
  approver text,
  status text CHECK (status IN ('todo','in_progress','blocked','done')) DEFAULT 'todo',
  priority text CHECK (priority IN ('p3','p2','p1','urgent')) DEFAULT 'p2',
  due_at date,
  success_criteria text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS for campaign_tasks
ALTER TABLE campaign_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policy for campaign_tasks (inherit from campaign)
CREATE POLICY "Users can manage campaign tasks for their campaigns" ON campaign_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_tasks.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_campaign_tasks_campaign ON campaign_tasks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_tasks_status ON campaign_tasks(status);

-- Campaign budget items
CREATE TABLE IF NOT EXISTS campaign_budget_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  item text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  category text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for campaign_budget_items
ALTER TABLE campaign_budget_items ENABLE ROW LEVEL SECURITY;

-- RLS policy for campaign_budget_items (inherit from campaign)
CREATE POLICY "Users can manage budget items for their campaigns" ON campaign_budget_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_budget_items.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_campaign_budget_items_campaign ON campaign_budget_items(campaign_id);

-- Campaign updates/activity feed
CREATE TABLE IF NOT EXISTS campaign_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  title text,
  body text,
  kind text CHECK (kind IN ('metric','milestone','note','risk','fix')) DEFAULT 'note',
  created_by text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for campaign_updates
ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;

-- RLS policy for campaign_updates (inherit from campaign)
CREATE POLICY "Users can manage updates for their campaigns" ON campaign_updates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_updates.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_campaign_updates_campaign ON campaign_updates(campaign_id);

-- Campaign reports (24h/48h/3d/7d snapshots)
CREATE TABLE IF NOT EXISTS campaign_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  window text CHECK (window IN ('24h','48h','3d','7d')) NOT NULL,
  generated_at timestamptz DEFAULT now(),
  kpis jsonb,
  notes text
);

-- Enable RLS for campaign_reports
ALTER TABLE campaign_reports ENABLE ROW LEVEL SECURITY;

-- RLS policy for campaign_reports (inherit from campaign)
CREATE POLICY "Users can view reports for their campaigns" ON campaign_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_reports.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_campaign_reports_campaign ON campaign_reports(campaign_id, window);

-- Notifications system
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  scope_kind text CHECK (scope_kind IN ('talent','brand','campaign','system')) DEFAULT 'campaign',
  scope_id uuid,
  title text NOT NULL,
  body text,
  level text CHECK (level IN ('info','success','warning','error')) DEFAULT 'info',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_scope ON notifications(scope_kind, scope_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Function to calculate campaign progress
CREATE OR REPLACE FUNCTION calculate_campaign_progress(campaign_uuid uuid)
RETURNS numeric AS $$
DECLARE
  total_tasks integer;
  done_tasks integer;
BEGIN
  SELECT COUNT(*) INTO total_tasks 
  FROM campaign_tasks 
  WHERE campaign_id = campaign_uuid;
  
  IF total_tasks = 0 THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*) INTO done_tasks 
  FROM campaign_tasks 
  WHERE campaign_id = campaign_uuid AND status = 'done';
  
  RETURN ROUND((done_tasks::numeric / total_tasks::numeric) * 100, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate campaign report data
CREATE OR REPLACE FUNCTION generate_campaign_report_data(campaign_uuid uuid, report_window text)
RETURNS jsonb AS $$
DECLARE
  window_start timestamptz;
  total_tasks integer;
  done_tasks integer;
  in_progress_tasks integer;
  todo_tasks integer;
  blocked_tasks integer;
  updates_count integer;
  last_update timestamptz;
  budget_total numeric;
  result jsonb;
BEGIN
  -- Calculate window start time
  CASE report_window
    WHEN '24h' THEN window_start := now() - interval '24 hours';
    WHEN '48h' THEN window_start := now() - interval '48 hours';
    WHEN '3d' THEN window_start := now() - interval '3 days';
    WHEN '7d' THEN window_start := now() - interval '7 days';
    ELSE window_start := now() - interval '24 hours';
  END CASE;
  
  -- Get task counts
  SELECT COUNT(*) INTO total_tasks FROM campaign_tasks WHERE campaign_id = campaign_uuid;
  SELECT COUNT(*) INTO done_tasks FROM campaign_tasks WHERE campaign_id = campaign_uuid AND status = 'done';
  SELECT COUNT(*) INTO in_progress_tasks FROM campaign_tasks WHERE campaign_id = campaign_uuid AND status = 'in_progress';
  SELECT COUNT(*) INTO todo_tasks FROM campaign_tasks WHERE campaign_id = campaign_uuid AND status = 'todo';
  SELECT COUNT(*) INTO blocked_tasks FROM campaign_tasks WHERE campaign_id = campaign_uuid AND status = 'blocked';
  
  -- Get updates count in window
  SELECT COUNT(*) INTO updates_count 
  FROM campaign_updates 
  WHERE campaign_id = campaign_uuid AND created_at >= window_start;
  
  -- Get last update time
  SELECT MAX(created_at) INTO last_update 
  FROM campaign_updates 
  WHERE campaign_id = campaign_uuid;
  
  -- Get budget total
  SELECT COALESCE(SUM(amount), 0) INTO budget_total 
  FROM campaign_budget_items 
  WHERE campaign_id = campaign_uuid;
  
  -- Build result JSON
  result := jsonb_build_object(
    'window', report_window,
    'window_start', window_start,
    'generated_at', now(),
    'tasks', jsonb_build_object(
      'total', total_tasks,
      'done', done_tasks,
      'in_progress', in_progress_tasks,
      'todo', todo_tasks,
      'blocked', blocked_tasks,
      'completion_pct', CASE WHEN total_tasks > 0 THEN ROUND((done_tasks::numeric / total_tasks::numeric) * 100, 2) ELSE 0 END
    ),
    'activity', jsonb_build_object(
      'updates_in_window', updates_count,
      'last_update', last_update
    ),
    'budget', jsonb_build_object(
      'total_allocated', budget_total
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
