# Supabase backend — Gangsterka

Tato složka obsahuje databázový základ pro chat v DC20 aplikaci.

## Co migrace vytváří

- `profiles` — jméno a avatar hráče
- `channels` — chatovací místnosti
- `channel_members` — členství a role owner/admin/member
- `messages` — trvale uložené zprávy a reply vazby
- `attachments` — metadata obrázků, GIFů a souborů
- `reactions` — emoji reakce
- privátní Storage bucket `chat-media` (max 10 MB, JPEG/PNG/WebP/GIF)
- Row Level Security pro všechny tabulky
- Realtime publikaci pro zprávy, přílohy a reakce
- automatické vytvoření profilu po registraci
- automatickou hlavní místnost `Družina`; každý pozvaný uživatel je do ní přidán

## Bezpečnost

Frontend bude používat pouze veřejný/publishable Supabase klíč. Ten může být v prohlížeči, protože přístup k datům řídí RLS.

**Nikdy nedávat do GitHubu ani do JavaScriptu `service_role` key.**

V produkci chceme ponechat registraci uzavřenou / pouze pro pozvané hráče. Tím je hlavní místnost Družina skutečně soukromá.

## Nasazení

Migrace je v:

`supabase/migrations/20260923_01_chat_backend.sql`

Po připojení Supabase projektu ji lze aplikovat přes Supabase nástroje nebo SQL Editor. Další krok projektu (6/15) připojí Auth a frontend klienta.

## Realtime

Pro naši malou skupinu používáme jednoduché Postgres Changes. Supabase doporučuje Broadcast pro větší škálování, ale pro několik hráčů je Postgres Changes výrazně jednodušší a dostatečný. Pokud by se aplikace později rozrostla, můžeme transport změnit bez změny uložených zpráv.
