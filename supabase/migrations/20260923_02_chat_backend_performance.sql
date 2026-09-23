create index if not exists attachments_channel_idx on public.attachments(channel_id);
create index if not exists attachments_user_idx on public.attachments(user_id);
create index if not exists channels_created_by_idx on public.channels(created_by);
create index if not exists messages_reply_to_idx on public.messages(reply_to);
create index if not exists messages_user_idx on public.messages(user_id);
create index if not exists reactions_channel_idx on public.reactions(channel_id);
create index if not exists reactions_user_idx on public.reactions(user_id);

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
      and cm.user_id = (select auth.uid())
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
      and cm.user_id = (select auth.uid())
      and cm.role in ('owner','admin')
  );
$$;

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
on public.profiles for update to authenticated
using (id=(select auth.uid()))
with check (id=(select auth.uid()));

drop policy if exists "signed-in users create channels" on public.channels;
create policy "signed-in users create channels"
on public.channels for insert to authenticated
with check (created_by=(select auth.uid()));

drop policy if exists "admins remove members or user leaves" on public.channel_members;
create policy "admins remove members or user leaves"
on public.channel_members for delete to authenticated
using (private.is_channel_admin(channel_id) or user_id=(select auth.uid()));

drop policy if exists "members send messages" on public.messages;
create policy "members send messages"
on public.messages for insert to authenticated
with check (user_id=(select auth.uid()) and private.is_channel_member(channel_id));

drop policy if exists "authors edit messages" on public.messages;
create policy "authors edit messages"
on public.messages for update to authenticated
using (user_id=(select auth.uid()) and private.is_channel_member(channel_id))
with check (user_id=(select auth.uid()) and private.is_channel_member(channel_id));

drop policy if exists "authors or admins delete messages" on public.messages;
create policy "authors or admins delete messages"
on public.messages for delete to authenticated
using (user_id=(select auth.uid()) or private.is_channel_admin(channel_id));

drop policy if exists "members add own attachments" on public.attachments;
create policy "members add own attachments"
on public.attachments for insert to authenticated
with check (user_id=(select auth.uid()) and private.is_channel_member(channel_id));

drop policy if exists "authors edit attachments" on public.attachments;
create policy "authors edit attachments"
on public.attachments for update to authenticated
using (user_id=(select auth.uid()))
with check (user_id=(select auth.uid()) and private.is_channel_member(channel_id));

drop policy if exists "authors or admins delete attachments" on public.attachments;
create policy "authors or admins delete attachments"
on public.attachments for delete to authenticated
using (user_id=(select auth.uid()) or private.is_channel_admin(channel_id));

drop policy if exists "members add own reactions" on public.reactions;
create policy "members add own reactions"
on public.reactions for insert to authenticated
with check (user_id=(select auth.uid()) and private.is_channel_member(channel_id));

drop policy if exists "users remove own reactions" on public.reactions;
create policy "users remove own reactions"
on public.reactions for delete to authenticated
using (user_id=(select auth.uid()));

drop policy if exists "members upload own chat media" on storage.objects;
create policy "members upload own chat media"
on storage.objects for insert to authenticated
with check (
  bucket_id='chat-media'
  and private.is_channel_member((storage.foldername(name))[1]::uuid)
  and (storage.foldername(name))[2]=(select auth.uid())::text
);

drop policy if exists "members update own chat media" on storage.objects;
create policy "members update own chat media"
on storage.objects for update to authenticated
using (
  bucket_id='chat-media'
  and (storage.foldername(name))[2]=(select auth.uid())::text
)
with check (
  bucket_id='chat-media'
  and private.is_channel_member((storage.foldername(name))[1]::uuid)
  and (storage.foldername(name))[2]=(select auth.uid())::text
);

drop policy if exists "members delete own chat media" on storage.objects;
create policy "members delete own chat media"
on storage.objects for delete to authenticated
using (
  bucket_id='chat-media'
  and (
    (storage.foldername(name))[2]=(select auth.uid())::text
    or private.is_channel_admin((storage.foldername(name))[1]::uuid)
  )
);
