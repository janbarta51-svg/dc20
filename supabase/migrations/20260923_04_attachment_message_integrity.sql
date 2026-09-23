drop policy if exists "members add own attachments" on public.attachments;
create policy "members add own attachments"
on public.attachments for insert to authenticated
with check (
  user_id=(select auth.uid())
  and private.is_channel_member(channel_id)
  and exists (
    select 1
    from public.messages m
    where m.id=message_id
      and m.channel_id=attachments.channel_id
      and m.user_id=(select auth.uid())
  )
);

drop policy if exists "authors edit attachments" on public.attachments;
create policy "authors edit attachments"
on public.attachments for update to authenticated
using (user_id=(select auth.uid()))
with check (
  user_id=(select auth.uid())
  and private.is_channel_member(channel_id)
  and exists (
    select 1
    from public.messages m
    where m.id=message_id
      and m.channel_id=attachments.channel_id
      and m.user_id=(select auth.uid())
  )
);
