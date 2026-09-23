-- Gangsterka / DC20 chat backend
-- Prepared for Supabase Postgres + Auth + Storage + Realtime.
-- This migration is safe to keep in Git. Never place a service_role key in the web app.

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,40}$'),
  name text not null check (char_length(name) between 1 and 80),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.channel_members (
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  joined_at timestamptz not null default now(),
  primary key (channel_id,user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null default '' check (char_length(body) <= 8000),
  reply_to uuid references public.messages(id) on delete set null,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  kind text not null default 'image' check (kind in ('image','gif','file')),
  mime_type text,
  file_name text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.reactions (
  message_id uuid not null references public.messages(id) on delete cascade,
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 32),
  created_at timestamptz not null default now(),
  primary key (message_id,user_id,emoji)
);

create index if not exists messages_channel_created_idx
  on public.messages(channel_id,created_at desc);
create index if not exists attachments_message_idx
  on public.attachments(message_id);
create index if not exists reactions_message_idx
  on public.reactions(message_id);
create index if not exists channel_members_user_idx
  on public.channel_members(user_id);

create or replace function private.is_channel_member(target_channel uuid)
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
      and cm.user_id = auth.uid()
  );
$$;

create or replace function private.is_channel_admin(target_channel uuid)
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
      and cm.user_id = auth.uid()
      and cm.role in ('owner','admin')
  );
$$;

revoke all on function private.is_channel_member(uuid) from public, anon;
revoke all on function private.is_channel_admin(uuid) from public, anon;
grant execute on function private.is_channel_member(uuid) to authenticated, service_role;
grant execute on function private.is_channel_admin(uuid) to authenticated, service_role;

create or replace function private.add_channel_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.channel_members(channel_id,user_id,role)
  values (new.id,new.created_by,'owner')
  on conflict (channel_id,user_id) do update set role='owner';
  return new;
end;
$$;

drop trigger if exists channel_owner_after_insert on public.channels;
create trigger channel_owner_after_insert
after insert on public.channels
for each row execute function private.add_channel_owner();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  party_channel uuid;
begin
  insert into public.profiles(id,display_name,avatar_url)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name',''), split_part(coalesce(new.email,'hrac'),'@',1)),
    nullif(new.raw_user_meta_data ->> 'avatar_url','')
  )
  on conflict (id) do nothing;

  select id into party_channel
  from public.channels
  where slug='druzina'
  limit 1;

  if party_channel is null then
    insert into public.channels(slug,name,created_by)
    values ('druzina','Družina',new.id)
    returning id into party_channel;
    -- channel_owner_after_insert adds the creator as owner.
  end if;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.add_channel_owner() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.channels enable row level security;
alter table public.channel_members enable row level security;
alter table public.messages enable row level security;
alter table public.attachments enable row level security;
alter table public.reactions enable row level security;

revoke all on public.profiles, public.channels, public.channel_members,
  public.messages, public.attachments, public.reactions
from anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.channels to authenticated;
grant select, insert, update, delete on public.channel_members to authenticated;
grant select, insert, update, delete on public.messages to authenticated;
grant select, insert, update, delete on public.attachments to authenticated;
grant select, insert, delete on public.reactions to authenticated;

grant all on public.profiles, public.channels, public.channel_members,
  public.messages, public.attachments, public.reactions
to service_role;

drop policy if exists "profiles readable by signed-in users" on public.profiles;
create policy "profiles readable by party peers"
on public.profiles for select to authenticated
using (
  id=(select auth.uid())
  or exists (
    select 1
    from public.channel_members mine
    join public.channel_members theirs
      on theirs.channel_id=mine.channel_id
    where mine.user_id=(select auth.uid())
      and theirs.user_id=profiles.id
  )
);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
on public.profiles for update to authenticated
using (id=auth.uid())
with check (id=auth.uid());

drop policy if exists "members read channels" on public.channels;
create policy "members read channels"
on public.channels for select to authenticated
using (private.is_channel_member(id));

drop policy if exists "signed-in users create channels" on public.channels;
create policy "signed-in users create channels"
on public.channels for insert to authenticated
with check (created_by=auth.uid());

drop policy if exists "admins update channels" on public.channels;
create policy "admins update channels"
on public.channels for update to authenticated
using (private.is_channel_admin(id))
with check (private.is_channel_admin(id));

drop policy if exists "admins delete channels" on public.channels;
create policy "admins delete channels"
on public.channels for delete to authenticated
using (private.is_channel_admin(id));

drop policy if exists "members read memberships" on public.channel_members;
create policy "members read memberships"
on public.channel_members for select to authenticated
using (private.is_channel_member(channel_id));

drop policy if exists "admins add members" on public.channel_members;
create policy "admins add members"
on public.channel_members for insert to authenticated
with check (private.is_channel_admin(channel_id));

drop policy if exists "admins update members" on public.channel_members;
create policy "admins update members"
on public.channel_members for update to authenticated
using (private.is_channel_admin(channel_id))
with check (private.is_channel_admin(channel_id));

drop policy if exists "admins remove members or user leaves" on public.channel_members;
create policy "admins remove members or user leaves"
on public.channel_members for delete to authenticated
using (private.is_channel_admin(channel_id) or user_id=auth.uid());

drop policy if exists "members read messages" on public.messages;
create policy "members read messages"
on public.messages for select to authenticated
using (private.is_channel_member(channel_id));

drop policy if exists "members send messages" on public.messages;
create policy "members send messages"
on public.messages for insert to authenticated
with check (user_id=auth.uid() and private.is_channel_member(channel_id));

drop policy if exists "authors edit messages" on public.messages;
create policy "authors edit messages"
on public.messages for update to authenticated
using (user_id=auth.uid() and private.is_channel_member(channel_id))
with check (user_id=auth.uid() and private.is_channel_member(channel_id));

drop policy if exists "authors or admins delete messages" on public.messages;
create policy "authors or admins delete messages"
on public.messages for delete to authenticated
using (user_id=auth.uid() or private.is_channel_admin(channel_id));

drop policy if exists "members read attachments" on public.attachments;
create policy "members read attachments"
on public.attachments for select to authenticated
using (private.is_channel_member(channel_id));

drop policy if exists "members add own attachments" on public.attachments;
create policy "members add own attachments"
on public.attachments for insert to authenticated
with check (user_id=auth.uid() and private.is_channel_member(channel_id));

drop policy if exists "authors edit attachments" on public.attachments;
create policy "authors edit attachments"
on public.attachments for update to authenticated
using (user_id=auth.uid())
with check (user_id=auth.uid() and private.is_channel_member(channel_id));

drop policy if exists "authors or admins delete attachments" on public.attachments;
create policy "authors or admins delete attachments"
on public.attachments for delete to authenticated
using (user_id=auth.uid() or private.is_channel_admin(channel_id));

drop policy if exists "members read reactions" on public.reactions;
create policy "members read reactions"
on public.reactions for select to authenticated
using (private.is_channel_member(channel_id));

drop policy if exists "members add own reactions" on public.reactions;
create policy "members add own reactions"
on public.reactions for insert to authenticated
with check (user_id=auth.uid() and private.is_channel_member(channel_id));

drop policy if exists "users remove own reactions" on public.reactions;
create policy "users remove own reactions"
on public.reactions for delete to authenticated
using (user_id=auth.uid());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values (
  'chat-media',
  'chat-media',
  false,
  10485760,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update
set public=false,
    file_size_limit=excluded.file_size_limit,
    allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "party members read chat media" on storage.objects;
create policy "party members read chat media"
on storage.objects for select to authenticated
using (
  bucket_id='chat-media'
  and private.is_channel_member((storage.foldername(name))[1]::uuid)
);

drop policy if exists "members upload own chat media" on storage.objects;
create policy "members upload own chat media"
on storage.objects for insert to authenticated
with check (
  bucket_id='chat-media'
  and private.is_channel_member((storage.foldername(name))[1]::uuid)
  and (storage.foldername(name))[2]=auth.uid()::text
);

drop policy if exists "members update own chat media" on storage.objects;
create policy "members update own chat media"
on storage.objects for update to authenticated
using (
  bucket_id='chat-media'
  and (storage.foldername(name))[2]=auth.uid()::text
)
with check (
  bucket_id='chat-media'
  and private.is_channel_member((storage.foldername(name))[1]::uuid)
  and (storage.foldername(name))[2]=auth.uid()::text
);

drop policy if exists "members delete own chat media" on storage.objects;
create policy "members delete own chat media"
on storage.objects for delete to authenticated
using (
  bucket_id='chat-media'
  and (
    (storage.foldername(name))[2]=auth.uid()::text
    or private.is_channel_admin((storage.foldername(name))[1]::uuid)
  )
);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='attachments'
  ) then
    alter publication supabase_realtime add table public.attachments;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='reactions'
  ) then
    alter publication supabase_realtime add table public.reactions;
  end if;
end
$$;
