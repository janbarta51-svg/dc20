-- Party calendar added after the 15-step app build.
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  title text not null default 'DC20 – Kostelec',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'Europe/Prague',
  location text,
  description text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_sessions_time_order check (ends_at > starts_at),
  constraint game_sessions_title_len check (char_length(title) between 1 and 120),
  constraint game_sessions_location_len check (location is null or char_length(location) <= 240),
  constraint game_sessions_description_len check (description is null or char_length(description) <= 2000),
  constraint game_sessions_timezone_check check (timezone = 'Europe/Prague')
);

create index if not exists game_sessions_channel_start_idx
on public.game_sessions(channel_id, starts_at);

create index if not exists game_sessions_created_by_idx
on public.game_sessions(created_by);

alter table public.game_sessions enable row level security;
revoke all on public.game_sessions from anon, authenticated;
grant select, insert, update, delete on public.game_sessions to authenticated;
grant all on public.game_sessions to service_role;

drop policy if exists "members read game sessions" on public.game_sessions;
create policy "members read game sessions"
on public.game_sessions for select to authenticated
using (private.is_channel_member(channel_id));

drop policy if exists "admins create game sessions" on public.game_sessions;
create policy "admins create game sessions"
on public.game_sessions for insert to authenticated
with check (
  created_by=(select auth.uid())
  and private.is_channel_admin(channel_id)
);

drop policy if exists "admins update game sessions" on public.game_sessions;
create policy "admins update game sessions"
on public.game_sessions for update to authenticated
using (private.is_channel_admin(channel_id))
with check (private.is_channel_admin(channel_id));

drop policy if exists "admins delete game sessions" on public.game_sessions;
create policy "admins delete game sessions"
on public.game_sessions for delete to authenticated
using (private.is_channel_admin(channel_id));

create or replace function private.touch_game_session_updated_at()
returns trigger
language plpgsql
set search_path=''
as $$
begin
  new.updated_at=now();
  new.channel_id=old.channel_id;
  new.created_by=old.created_by;
  new.created_at=old.created_at;
  return new;
end;
$$;

revoke all on function private.touch_game_session_updated_at() from public, anon;
grant execute on function private.touch_game_session_updated_at() to authenticated, service_role;

drop trigger if exists touch_game_session_updated_at on public.game_sessions;
create trigger touch_game_session_updated_at
before update on public.game_sessions
for each row execute function private.touch_game_session_updated_at();

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime'
      and schemaname='public'
      and tablename='game_sessions'
  ) then
    alter publication supabase_realtime add table public.game_sessions;
  end if;
end
$$;
