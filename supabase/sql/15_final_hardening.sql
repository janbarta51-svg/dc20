-- Step 15 final hardening found during end-to-end verification.
-- Applied to production on 2026-09-23.

drop policy if exists "admins delete channels" on public.channels;
drop policy if exists "owner deletes channels" on public.channels;
create policy "owner deletes channels"
on public.channels for delete to authenticated
using (private.is_channel_owner(id));

drop policy if exists "admins update channels" on public.channels;
drop policy if exists "owner updates channels" on public.channels;
create policy "owner updates channels"
on public.channels for update to authenticated
using (private.is_channel_owner(id))
with check (private.is_channel_owner(id));

drop policy if exists "profiles readable by party peers" on public.profiles;
create policy "profiles readable by party peers"
on public.profiles for select to authenticated
using (private.can_view_profile(id));

alter table public.push_subscriptions
  drop constraint if exists push_subscriptions_endpoint_https_check,
  add constraint push_subscriptions_endpoint_https_check
    check (endpoint ~ '^https://');

-- The send-chat-push Edge Function additionally allowlists known Web Push
-- provider hostnames and deduplicates one dispatch per message.
