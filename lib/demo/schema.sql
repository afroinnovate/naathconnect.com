-- Local demo schema. Mirrors supabase/migrations/001_init.sql.
-- Passwords live only in credentials, which has no production equivalent
-- (Supabase Auth holds those).

create table if not exists profiles (
  id text primary key,
  email text not null unique,
  full_name text not null,
  business_name text not null,
  profession text not null,
  service_area text not null,
  bio text not null,
  website text,
  public_contact text,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  role text not null check (role in ('admin', 'professional')),
  review_note text,
  created_at text not null,
  reviewed_at text,
  consultation_category text,
  consultation_category_label text,
  consultation_headline text,
  specialty text,
  credentials text,
  contact_note text,
  gallery_json text not null default '[]',
  featured_consultation integer not null default 0
);

create table if not exists credentials (
  user_id text primary key references profiles(id) on delete cascade,
  password_hash text not null
);

create table if not exists events (
  id text primary key,
  professional_id text not null references profiles(id),
  title text not null,
  summary text not null,
  body text not null,
  starts_at text not null,
  location_label text not null,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  view_count integer not null default 0,
  like_count integer not null default 0,
  heart_count integer not null default 0,
  review_note text,
  created_at text not null,
  reviewed_at text
);

create table if not exists event_views (
  event_id text not null references events(id) on delete cascade,
  viewer_key text not null,
  viewed_on text not null,
  primary key (event_id, viewer_key, viewed_on)
);

create table if not exists event_reactions (
  event_id text not null references events(id) on delete cascade,
  user_id text not null references profiles(id) on delete cascade,
  reaction text not null check (reaction in ('like', 'heart')),
  created_at text not null,
  primary key (event_id, user_id, reaction)
);

create index if not exists profiles_status_idx on profiles (status);
create index if not exists events_status_starts_idx on events (status, starts_at);
create index if not exists profiles_featured_idx on profiles (featured_consultation, consultation_category);

create table if not exists testimonials (
  id text primary key,
  profile_id text not null references profiles(id) on delete cascade,
  quote text not null,
  client_name text not null,
  client_role text,
  given_on text,
  created_at text not null,
  updated_at text not null
);

create index if not exists testimonials_profile_idx on testimonials (profile_id, created_at);
