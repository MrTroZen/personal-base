create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  appearance text not null default 'system',
  currency text not null default 'BDT',
  timezone text not null default 'Asia/Dhaka',
  week_start text not null default 'monday',
  updated_at timestamptz not null default now(),
  constraint user_preferences_appearance_valid check (appearance in ('system', 'light', 'dark')),
  constraint user_preferences_currency_valid check (currency ~ '^[A-Z]{3}$'),
  constraint user_preferences_timezone_length check (char_length(timezone) between 1 and 64),
  constraint user_preferences_week_start_valid check (week_start in ('monday', 'sunday'))
);

alter table public.user_preferences enable row level security;

create policy "Users can manage their own preferences"
  on public.user_preferences
  for all
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

revoke all on table public.user_preferences from anon;
grant select, insert, update on table public.user_preferences to authenticated;
