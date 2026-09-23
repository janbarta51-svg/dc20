create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx
on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

revoke all on public.push_subscriptions from anon, authenticated;
grant select, insert, update, delete on public.push_subscriptions to authenticated;
grant all on public.push_subscriptions to service_role;

drop policy if exists "users read own push subscriptions" on public.push_subscriptions;
create policy "users read own push subscriptions"
on public.push_subscriptions for select to authenticated
using (user_id=(select auth.uid()));

drop policy if exists "users add own push subscriptions" on public.push_subscriptions;
create policy "users add own push subscriptions"
on public.push_subscriptions for insert to authenticated
with check (user_id=(select auth.uid()));

drop policy if exists "users update own push subscriptions" on public.push_subscriptions;
create policy "users update own push subscriptions"
on public.push_subscriptions for update to authenticated
using (user_id=(select auth.uid()))
with check (user_id=(select auth.uid()));

drop policy if exists "users delete own push subscriptions" on public.push_subscriptions;
create policy "users delete own push subscriptions"
on public.push_subscriptions for delete to authenticated
using (user_id=(select auth.uid()));

create table if not exists public.push_server_secrets (
  id text primary key,
  vapid_public_key text not null,
  vapid_private_key text not null,
  vapid_subject text not null,
  updated_at timestamptz not null default now()
);

alter table public.push_server_secrets enable row level security;
revoke all on public.push_server_secrets from anon, authenticated;
grant select on public.push_server_secrets to service_role;

-- VAPID private keys are intentionally NOT stored in this migration.
-- Generate/store them directly in the production database or secret manager.
