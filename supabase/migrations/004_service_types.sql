-- Service types on directory profiles.
-- Apply in the Supabase SQL editor after review. This file does not run by itself.
-- Allowed values: Business, Free/Volunteer, Charity.
-- An empty array means the type is not set. Do not guess one.

alter table public.profiles
  add column if not exists service_types text[] not null default '{}';

alter table public.profiles
  drop constraint if exists profiles_service_types_check;

alter table public.profiles
  add constraint profiles_service_types_check
  check (service_types <@ array['Business', 'Free/Volunteer', 'Charity']::text[]);
