-- Automatically join every newly registered account to the single Družina.
-- Existing users without membership are backfilled once when this is applied.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  party_channel uuid;
  bootstrap_code text;
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
    select owner_code into bootstrap_code
    from private.party_bootstrap
    where id='default' and claimed_at is null
    for update;

    if bootstrap_code is not null
       and coalesce(new.raw_user_meta_data ->> 'owner_code','') = bootstrap_code then
      insert into public.channels(slug,name,created_by)
      values ('druzina','Družina',new.id)
      returning id into party_channel;

      update private.party_bootstrap
      set claimed_by=new.id, claimed_at=now()
      where id='default';
    end if;
  end if;

  if party_channel is not null then
    insert into public.channel_members(channel_id,user_id,role)
    values (party_channel,new.id,'member')
    on conflict (channel_id,user_id) do nothing;
  end if;

  update auth.users
  set raw_user_meta_data = coalesce(raw_user_meta_data,'{}'::jsonb) - 'owner_code'
  where id=new.id
    and raw_user_meta_data ? 'owner_code';

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

with party as (
  select id from public.channels where slug='druzina' limit 1
)
insert into public.channel_members(channel_id,user_id,role)
select party.id,u.id,'member'
from auth.users u
cross join party
where not exists (
  select 1 from public.channel_members cm
  where cm.channel_id=party.id and cm.user_id=u.id
)
on conflict (channel_id,user_id) do nothing;
