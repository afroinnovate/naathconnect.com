-- Naath Connect directory, events, and consultation profiles.
-- Apply in the Supabase SQL editor or via the Supabase CLI.
-- This file does not create a project and does not put a card on file.
--
-- After Tango signs up with his real email, promote that account:
--   update public.profiles
--   set role = 'admin', status = 'approved', full_name = 'Tango Tew'
--   where email = 'the-email-he-used';
--
-- View counts are signed. Set the same secret here and in VIEW_SIGNING_SECRET:
--   insert into naath_private.secrets (name, value)
--   values ('view_hmac', 'paste-a-long-random-string')
--   on conflict (name) do update set value = excluded.value;

create extension if not exists pgcrypto with schema extensions;

create schema if not exists naath_private;
revoke all on schema naath_private from public, anon, authenticated;

create table if not exists naath_private.secrets (
  name text primary key,
  value text not null
);
revoke all on naath_private.secrets from public, anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  business_name text not null default '',
  profession text not null default '',
  service_area text not null default '',
  bio text not null default '',
  website text,
  public_contact text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  role text not null default 'professional' check (role in ('admin', 'professional')),
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  consultation_category text,
  consultation_category_label text,
  consultation_headline text,
  specialty text,
  credentials text,
  contact_note text,
  gallery_json jsonb not null default '[]'::jsonb,
  featured_consultation boolean not null default false
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  summary text not null,
  body text not null,
  starts_at timestamptz not null,
  location_label text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  view_count integer not null default 0,
  like_count integer not null default 0,
  heart_count integer not null default 0,
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.event_views (
  event_id uuid not null references public.events (id) on delete cascade,
  viewer_key text not null,
  viewed_on date not null,
  primary key (event_id, viewer_key, viewed_on)
);

create table if not exists public.event_reactions (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reaction text not null check (reaction in ('like', 'heart')),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id, reaction)
);

create index if not exists profiles_status_idx on public.profiles (status);
create index if not exists events_status_starts_idx on public.events (status, starts_at);
create index if not exists profiles_featured_idx on public.profiles (featured_consultation, consultation_category);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'approved'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, email, full_name, business_name, profession, service_area, bio, website, public_contact,
    status, role, gallery_json, featured_consultation
  ) values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'business_name', ''),
    coalesce(new.raw_user_meta_data->>'profession', ''),
    coalesce(new.raw_user_meta_data->>'service_area', ''),
    coalesce(new.raw_user_meta_data->>'bio', ''),
    nullif(new.raw_user_meta_data->>'website', ''),
    nullif(new.raw_user_meta_data->>'public_contact', ''),
    'pending',
    'professional',
    '[]'::jsonb,
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.protect_profile()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and auth.uid() is not null and not public.is_admin() then
    new.id := auth.uid();
    new.status := 'pending';
    new.role := 'professional';
    new.review_note := null;
    new.reviewed_at := null;
    new.featured_consultation := false;
    new.consultation_category := null;
    new.consultation_category_label := null;
  end if;
  if tg_op = 'UPDATE' then
    new.id := old.id;
    new.created_at := old.created_at;
    if auth.uid() is not null and not public.is_admin() then
      new.status := old.status;
      new.role := old.role;
      new.email := old.email;
      new.review_note := old.review_note;
      new.reviewed_at := old.reviewed_at;
      new.featured_consultation := old.featured_consultation;
      new.consultation_category := old.consultation_category;
      new.consultation_category_label := old.consultation_category_label;
      new.consultation_headline := old.consultation_headline;
      new.specialty := old.specialty;
      new.credentials := old.credentials;
      new.contact_note := old.contact_note;
      new.gallery_json := old.gallery_json;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile on public.profiles;
create trigger protect_profile
  before insert or update on public.profiles
  for each row execute function public.protect_profile();

create or replace function public.protect_event()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and auth.uid() is not null and not public.is_admin() then
    new.status := 'pending';
    new.professional_id := auth.uid();
    new.view_count := 0;
    new.like_count := 0;
    new.heart_count := 0;
    new.review_note := null;
    new.reviewed_at := null;
  end if;
  if tg_op = 'UPDATE' and auth.uid() is not null and not public.is_admin() then
    new.status := old.status;
    new.review_note := old.review_note;
    new.reviewed_at := old.reviewed_at;
    new.professional_id := old.professional_id;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_event on public.events;
create trigger protect_event
  before insert or update on public.events
  for each row execute function public.protect_event();

create or replace function public.refresh_reaction_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
begin
  target := coalesce(new.event_id, old.event_id);
  update public.events e
  set
    like_count = (select count(*) from public.event_reactions r where r.event_id = target and r.reaction = 'like'),
    heart_count = (select count(*) from public.event_reactions r where r.event_id = target and r.reaction = 'heart')
  where e.id = target;
  return coalesce(new, old);
end;
$$;

drop trigger if exists refresh_reaction_counts on public.event_reactions;
create trigger refresh_reaction_counts
  after insert or delete on public.event_reactions
  for each row execute function public.refresh_reaction_counts();

-- Proof matches Node: HMAC-SHA256 hex of `${viewerKey}|${eventId}|${day}`.
create or replace function public.record_event_view(
  p_event_id uuid,
  p_viewer_key text,
  p_day text,
  p_proof text
)
returns integer
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_secret text;
  v_today text;
  v_expected text;
  v_count integer;
begin
  if p_viewer_key is null
     or length(p_viewer_key) < 16
     or length(p_viewer_key) > 128
     or p_viewer_key !~ '^[A-Za-z0-9_-]+$' then
    return coalesce((select view_count from public.events where id = p_event_id), 0);
  end if;

  v_today := to_char((now() at time zone 'utc')::date, 'YYYY-MM-DD');
  if p_day is distinct from v_today then
    return coalesce((select view_count from public.events where id = p_event_id), 0);
  end if;

  select value into v_secret from naath_private.secrets where name = 'view_hmac';
  if v_secret is null or length(v_secret) < 16 then
    return coalesce((select view_count from public.events where id = p_event_id), 0);
  end if;

  v_expected := encode(
    hmac(
      convert_to(p_viewer_key || '|' || p_event_id::text || '|' || p_day, 'UTF8'),
      convert_to(v_secret, 'UTF8'),
      'sha256'
    ),
    'hex'
  );
  if p_proof is distinct from v_expected then
    return coalesce((select view_count from public.events where id = p_event_id), 0);
  end if;

  if not exists (
    select 1 from public.events e
    join public.profiles p on p.id = e.professional_id
    where e.id = p_event_id and e.status = 'approved' and p.status = 'approved'
  ) then
    return coalesce((select view_count from public.events where id = p_event_id), 0);
  end if;

  if auth.uid() is not null and exists (
    select 1 from public.events e where e.id = p_event_id and e.professional_id = auth.uid()
  ) then
    return (select view_count from public.events where id = p_event_id);
  end if;

  insert into public.event_views (event_id, viewer_key, viewed_on)
  values (p_event_id, p_viewer_key, v_today::date)
  on conflict do nothing;

  update public.events e
  set view_count = (select count(*) from public.event_views v where v.event_id = e.id)
  where e.id = p_event_id
  returning view_count into v_count;

  return coalesce(v_count, 0);
end;
$$;

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_reactions enable row level security;
alter table public.event_views enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.events from anon, authenticated;
revoke all on public.event_reactions from anon, authenticated;
revoke all on public.event_views from anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant insert (
  id, email, full_name, business_name, profession, service_area, bio, website, public_contact, status, role
) on public.profiles to authenticated;
grant update (
  status, review_note, reviewed_at, consultation_category, consultation_category_label,
  consultation_headline, specialty, credentials, contact_note, gallery_json, featured_consultation
) on public.profiles to authenticated;

grant select on public.events to anon, authenticated;
grant insert (
  professional_id, title, summary, body, starts_at, location_label, status
) on public.events to authenticated;
grant update (status, review_note, reviewed_at) on public.events to authenticated;

grant select, insert, delete on public.event_reactions to authenticated;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.record_event_view(uuid, text, text, text) to anon, authenticated;
revoke all on function public.record_event_view(uuid, text, text, text) from public;

drop policy if exists "public read approved professionals" on public.profiles;
create policy "public read approved professionals"
  on public.profiles for select
  using (status = 'approved' and role = 'professional');

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile"
  on public.profiles for select
  using (id = auth.uid());

drop policy if exists "admin read profiles" on public.profiles;
create policy "admin read profiles"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "insert own pending profile" on public.profiles;
create policy "insert own pending profile"
  on public.profiles for insert
  with check (id = auth.uid() and status = 'pending' and role = 'professional');

drop policy if exists "admin update profiles" on public.profiles;
create policy "admin update profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "public read approved events" on public.events;
create policy "public read approved events"
  on public.events for select
  using (
    status = 'approved'
    and exists (
      select 1 from public.profiles p
      where p.id = professional_id and p.status = 'approved'
    )
  );

drop policy if exists "owner read own events" on public.events;
create policy "owner read own events"
  on public.events for select
  using (professional_id = auth.uid());

drop policy if exists "admin read events" on public.events;
create policy "admin read events"
  on public.events for select
  using (public.is_admin());

drop policy if exists "approved professional inserts pending event" on public.events;
create policy "approved professional inserts pending event"
  on public.events for insert
  with check (
    professional_id = auth.uid()
    and status = 'pending'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.status = 'approved' and p.role = 'professional'
    )
  );

drop policy if exists "admin update events" on public.events;
create policy "admin update events"
  on public.events for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "read own reactions" on public.event_reactions;
create policy "read own reactions"
  on public.event_reactions for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "insert own reaction" on public.event_reactions;
create policy "insert own reaction"
  on public.event_reactions for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.status = 'approved'
    )
    and exists (
      select 1 from public.events e
      join public.profiles host on host.id = e.professional_id
      where e.id = event_id
        and e.status = 'approved'
        and host.status = 'approved'
        and e.professional_id <> auth.uid()
    )
  );

drop policy if exists "delete own reaction" on public.event_reactions;
create policy "delete own reaction"
  on public.event_reactions for delete
  using (user_id = auth.uid());
