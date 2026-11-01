create unique index work_sessions_one_active_per_user_idx
  on public.work_sessions (user_id)
  where ended_at is null;
