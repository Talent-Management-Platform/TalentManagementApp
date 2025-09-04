-- Create team_members table for internal staff management
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('project_manager', 'content_creator', 'social_media_manager', 'pr_specialist', 'designer', 'developer', 'assistant', 'other')),
  department text,
  phone text,
  bio text,
  skills text[] default '{}',
  hourly_rate numeric,
  status text default 'active' check (status in ('active', 'inactive', 'on_leave')),
  hire_date date,
  profile_image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create task_assignments table for linking tasks to team members
create table if not exists public.task_assignments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  team_member_id uuid not null references public.team_members(id) on delete cascade,
  assigned_by uuid not null references auth.users(id) on delete cascade,
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  role_in_task text, -- e.g., 'lead', 'contributor', 'reviewer'
  estimated_hours numeric,
  actual_hours numeric,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.team_members enable row level security;
alter table public.task_assignments enable row level security;

-- RLS policies for team_members
create policy "team_members_select_own"
  on public.team_members for select
  using (auth.uid() = user_id);

create policy "team_members_insert_own"
  on public.team_members for insert
  with check (auth.uid() = user_id);

create policy "team_members_update_own"
  on public.team_members for update
  using (auth.uid() = user_id);

create policy "team_members_delete_own"
  on public.team_members for delete
  using (auth.uid() = user_id);

-- RLS policies for task_assignments
create policy "task_assignments_select_own"
  on public.task_assignments for select
  using (auth.uid() = assigned_by);

create policy "task_assignments_insert_own"
  on public.task_assignments for insert
  with check (auth.uid() = assigned_by);

create policy "task_assignments_update_own"
  on public.task_assignments for update
  using (auth.uid() = assigned_by);

create policy "task_assignments_delete_own"
  on public.task_assignments for delete
  using (auth.uid() = assigned_by);

-- Create indexes for better performance
create index if not exists team_members_user_id_idx on public.team_members(user_id);
create index if not exists team_members_role_idx on public.team_members(role);
create index if not exists team_members_status_idx on public.team_members(status);

create index if not exists task_assignments_task_id_idx on public.task_assignments(task_id);
create index if not exists task_assignments_team_member_id_idx on public.task_assignments(team_member_id);
create index if not exists task_assignments_assigned_by_idx on public.task_assignments(assigned_by);

-- Create unique constraint to prevent duplicate assignments
create unique index if not exists task_assignments_unique 
  on public.task_assignments(task_id, team_member_id);
