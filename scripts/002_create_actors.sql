-- Create actors/talents table
create table if not exists public.actors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  stage_name text,
  bio text,
  category text not null check (category in ('actor', 'entrepreneur', 'influencer', 'musician', 'athlete', 'other')),
  status text default 'active' check (status in ('active', 'inactive', 'on_break')),
  contact_email text,
  contact_phone text,
  social_media jsonb default '{}',
  profile_image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.actors enable row level security;

-- RLS policies for actors
create policy "actors_select_own"
  on public.actors for select
  using (auth.uid() = user_id);

create policy "actors_insert_own"
  on public.actors for insert
  with check (auth.uid() = user_id);

create policy "actors_update_own"
  on public.actors for update
  using (auth.uid() = user_id);

create policy "actors_delete_own"
  on public.actors for delete
  using (auth.uid() = user_id);

-- Create index for better performance
create index if not exists actors_user_id_idx on public.actors(user_id);
