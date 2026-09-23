create or replace function private.validate_message_reply_channel()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.reply_to is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.messages parent
    where parent.id = new.reply_to
      and parent.channel_id = new.channel_id
  ) then
    raise exception 'Reply target must belong to the same channel';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_message_reply_channel() from public, anon;
grant execute on function private.validate_message_reply_channel() to authenticated, service_role;

drop trigger if exists validate_message_reply_channel on public.messages;
create trigger validate_message_reply_channel
before insert or update of reply_to, channel_id on public.messages
for each row execute function private.validate_message_reply_channel();

drop policy if exists "members add own reactions" on public.reactions;
create policy "members add own reactions"
on public.reactions for insert to authenticated
with check (
  user_id=(select auth.uid())
  and private.is_channel_member(channel_id)
  and exists (
    select 1
    from public.messages m
    where m.id=reactions.message_id
      and m.channel_id=reactions.channel_id
  )
);

create table if not exists public.member_presence (
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_seen timestamptz not null default now(),
  primary key (channel_id,user_id)
);

create index if not exists member_presence_last_seen_idx
on public.member_presence(channel_id,last_seen desc);

alter table public.member_presence enable row level security;

grant select, insert, update, delete on public.member_presence to authenticated;
grant all on public.member_presence to service_role;

drop policy if exists "members read presence" on public.member_presence;
create policy "members read presence"
on public.member_presence for select to authenticated
using (private.is_channel_member(channel_id));

drop policy if exists "members insert own presence" on public.member_presence;
create policy "members insert own presence"
on public.member_presence for insert to authenticated
with check (
  user_id=(select auth.uid())
  and private.is_channel_member(channel_id)
);

drop policy if exists "members update own presence" on public.member_presence;
create policy "members update own presence"
on public.member_presence for update to authenticated
using (
  user_id=(select auth.uid())
  and private.is_channel_member(channel_id)
)
with check (
  user_id=(select auth.uid())
  and private.is_channel_member(channel_id)
);

drop policy if exists "members delete own presence" on public.member_presence;
create policy "members delete own presence"
on public.member_presence for delete to authenticated
using (user_id=(select auth.uid()));

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime'
      and schemaname='public'
      and tablename='member_presence'
  ) then
    alter publication supabase_realtime add table public.member_presence;
  end if;
end
$$;
