-- Step 14 security hardening mirror.
-- Applied to production through Supabase SQL on 2026-09-23.

create or replace function private.is_channel_owner(target_channel uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.channel_members cm
    where cm.channel_id = target_channel
      and cm.user_id = (select auth.uid())
      and cm.role = 'owner'
  );
$$;

revoke all on function private.is_channel_owner(uuid) from public, anon;
grant execute on function private.is_channel_owner(uuid) to authenticated, service_role;

create unique index if not exists channel_members_one_owner_idx
on public.channel_members(channel_id)
where role='owner';

drop policy if exists "admins add members" on public.channel_members;
drop policy if exists "owners and admins add members" on public.channel_members;
create policy "owners and admins add members"
on public.channel_members for insert to authenticated
with check (
  (private.is_channel_owner(channel_id) and role in ('admin','member'))
  or
  (private.is_channel_admin(channel_id) and not private.is_channel_owner(channel_id) and role='member')
);

drop policy if exists "admins update members" on public.channel_members;
drop policy if exists "owners update non-owner members" on public.channel_members;
create policy "owners update non-owner members"
on public.channel_members for update to authenticated
using (private.is_channel_owner(channel_id) and role <> 'owner')
with check (private.is_channel_owner(channel_id) and role in ('admin','member'));

drop policy if exists "admins remove members or user leaves" on public.channel_members;
drop policy if exists "safe member removal" on public.channel_members;
create policy "safe member removal"
on public.channel_members for delete to authenticated
using (
  role <> 'owner'
  and (
    user_id=(select auth.uid())
    or private.is_channel_owner(channel_id)
    or (
      private.is_channel_admin(channel_id)
      and not private.is_channel_owner(channel_id)
      and role='member'
    )
  )
);

drop policy if exists "signed-in users create channels" on public.channels;
revoke insert on public.channels from authenticated;

revoke all on public.member_presence from anon;
revoke all on public.member_presence from authenticated;
grant select,insert,update,delete on public.member_presence to authenticated;

create table if not exists public.push_dispatches (
  message_id uuid primary key references public.messages(id) on delete cascade,
  claimed_by uuid not null references auth.users(id) on delete cascade,
  claimed_at timestamptz not null default now()
);

alter table public.push_dispatches enable row level security;
revoke all on public.push_dispatches from anon, authenticated;
grant all on public.push_dispatches to service_role;
