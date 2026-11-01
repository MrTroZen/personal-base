create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text not null default '',
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_name_not_blank check (btrim(name) <> ''),
  constraint projects_name_length check (char_length(name) <= 120),
  constraint projects_id_user_key unique (id, user_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid,
  title text not null,
  description text not null default '',
  status text not null default 'todo',
  priority text not null default 'medium',
  sort_order integer not null default 0,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_title_not_blank check (btrim(title) <> ''),
  constraint tasks_title_length check (char_length(title) <= 200),
  constraint tasks_status_valid check (status in ('todo', 'in_progress', 'done')),
  constraint tasks_priority_valid check (priority in ('low', 'medium', 'high')),
  constraint tasks_sort_order_nonnegative check (sort_order >= 0),
  constraint tasks_completion_consistent check (
    (status = 'done' and completed_at is not null)
    or (status <> 'done' and completed_at is null)
  ),
  constraint tasks_id_user_key unique (id, user_id),
  constraint tasks_project_owner_fk
    foreign key (project_id, user_id)
    references public.projects (id, user_id)
    on delete set null (project_id)
);

create table public.work_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid,
  task_id uuid,
  started_at timestamptz not null,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  constraint work_sessions_time_order check (
    ended_at is null or ended_at > started_at
  ),
  constraint work_sessions_project_owner_fk
    foreign key (project_id, user_id)
    references public.projects (id, user_id)
    on delete set null (project_id),
  constraint work_sessions_task_owner_fk
    foreign key (task_id, user_id)
    references public.tasks (id, user_id)
    on delete set null (task_id)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid,
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notes_title_not_blank check (btrim(title) <> ''),
  constraint notes_title_length check (char_length(title) <= 200),
  constraint notes_project_owner_fk
    foreign key (project_id, user_id)
    references public.projects (id, user_id)
    on delete set null (project_id)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid,
  description text not null,
  kind text not null,
  amount numeric(14, 2) not null,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_description_not_blank check (btrim(description) <> ''),
  constraint transactions_description_length check (char_length(description) <= 200),
  constraint transactions_kind_valid check (kind in ('income', 'expense')),
  constraint transactions_amount_positive check (amount > 0),
  constraint transactions_project_owner_fk
    foreign key (project_id, user_id)
    references public.projects (id, user_id)
    on delete set null (project_id)
);

create index projects_user_id_idx on public.projects (user_id);
create index tasks_user_status_order_idx on public.tasks (user_id, status, sort_order);
create index tasks_project_owner_idx on public.tasks (project_id, user_id) where project_id is not null;
create index work_sessions_user_started_idx on public.work_sessions (user_id, started_at desc);
create index work_sessions_project_owner_idx on public.work_sessions (project_id, user_id) where project_id is not null;
create index work_sessions_task_owner_idx on public.work_sessions (task_id, user_id) where task_id is not null;
create index notes_user_updated_idx on public.notes (user_id, updated_at desc);
create index notes_project_owner_idx on public.notes (project_id, user_id) where project_id is not null;
create index transactions_user_occurred_idx on public.transactions (user_id, occurred_on desc);
create index transactions_project_owner_idx on public.transactions (project_id, user_id) where project_id is not null;

alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.work_sessions enable row level security;
alter table public.notes enable row level security;
alter table public.transactions enable row level security;

create policy "Users can manage their own projects"
  on public.projects
  for all
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can manage their own tasks"
  on public.tasks
  for all
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can manage their own work sessions"
  on public.work_sessions
  for all
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can manage their own notes"
  on public.notes
  for all
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can manage their own transactions"
  on public.transactions
  for all
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

revoke all on table public.projects, public.tasks, public.work_sessions, public.notes, public.transactions from anon;
grant select, insert, update, delete on table public.projects, public.tasks, public.work_sessions, public.notes, public.transactions to authenticated;
