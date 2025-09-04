-- Create PR items table for media coverage and articles
create table if not exists public.pr_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid not null references public.actors(id) on delete cascade,
  title text not null,
  description text,
  type text not null check (type in ('article', 'interview', 'podcast', 'video', 'social_post', 'press_release', 'review', 'other')),
  url text,
  publication text,
  author text,
  published_date timestamp with time zone,
  reach_estimate integer default 0,
  engagement_metrics jsonb default '{}',
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  tags text[] default '{}',
  status text default 'published' check (status in ('draft', 'scheduled', 'published', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.pr_items enable row level security;

-- RLS policies for PR items
create policy "pr_items_select_own"
  on public.pr_items for select
  using (auth.uid() = user_id);

create policy "pr_items_insert_own"
  on public.pr_items for insert
  with check (auth.uid() = user_id);

create policy "pr_items_update_own"
  on public.pr_items for update
  using (auth.uid() = user_id);

create policy "pr_items_delete_own"
  on public.pr_items for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists pr_items_user_id_idx on public.pr_items(user_id);
create index if not exists pr_items_actor_id_idx on public.pr_items(actor_id);
create index if not exists pr_items_published_date_idx on public.pr_items(published_date);
create index if not exists pr_items_type_idx on public.pr_items(type);
