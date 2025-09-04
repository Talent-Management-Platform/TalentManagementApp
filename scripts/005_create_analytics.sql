-- Create analytics table for tracking performance metrics
create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid not null references public.actors(id) on delete cascade,
  metric_type text not null check (metric_type in ('social_followers', 'engagement_rate', 'media_mentions', 'website_traffic', 'brand_sentiment', 'reach', 'impressions')),
  metric_value numeric not null,
  metric_date date not null,
  platform text, -- e.g., 'instagram', 'twitter', 'tiktok', 'website', etc.
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.analytics enable row level security;

-- RLS policies for analytics
create policy "analytics_select_own"
  on public.analytics for select
  using (auth.uid() = user_id);

create policy "analytics_insert_own"
  on public.analytics for insert
  with check (auth.uid() = user_id);

create policy "analytics_update_own"
  on public.analytics for update
  using (auth.uid() = user_id);

create policy "analytics_delete_own"
  on public.analytics for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists analytics_user_id_idx on public.analytics(user_id);
create index if not exists analytics_actor_id_idx on public.analytics(actor_id);
create index if not exists analytics_metric_date_idx on public.analytics(metric_date);
create index if not exists analytics_metric_type_idx on public.analytics(metric_type);

-- Create unique constraint to prevent duplicate metrics for same actor/date/type/platform
create unique index if not exists analytics_unique_metric 
  on public.analytics(actor_id, metric_date, metric_type, coalesce(platform, ''));
