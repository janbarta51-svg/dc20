-- Schema mirror for Step 11 (shared DC20 chat cards).
-- Applied to production via Supabase SQL on 2026-09-23.
alter table public.messages
  add column if not exists share_type text,
  add column if not exists share_key text,
  add column if not exists share_title text,
  add column if not exists share_subtitle text,
  add column if not exists share_body text,
  add column if not exists share_route text,
  add column if not exists share_image text;

alter table public.messages
  drop constraint if exists messages_share_type_check,
  add constraint messages_share_type_check
    check (share_type is null or share_type in ('spell','maneuver','character','gang','item')),
  drop constraint if exists messages_share_title_len_check,
  add constraint messages_share_title_len_check
    check (share_title is null or char_length(share_title) <= 160),
  drop constraint if exists messages_share_subtitle_len_check,
  add constraint messages_share_subtitle_len_check
    check (share_subtitle is null or char_length(share_subtitle) <= 240),
  drop constraint if exists messages_share_body_len_check,
  add constraint messages_share_body_len_check
    check (share_body is null or char_length(share_body) <= 1200),
  drop constraint if exists messages_share_route_len_check,
  add constraint messages_share_route_len_check
    check (share_route is null or char_length(share_route) <= 200),
  drop constraint if exists messages_share_image_len_check,
  add constraint messages_share_image_len_check
    check (share_image is null or char_length(share_image) <= 500);
