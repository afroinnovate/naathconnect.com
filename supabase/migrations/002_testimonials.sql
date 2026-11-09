-- Testimonials on a professional's own page.
-- Apply in the Supabase SQL editor after review. This file does not run by itself.
--
-- Public visitors can read every row. An approved signed-in account can
-- insert, update, and delete only the rows whose profile_id is their user id.

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  quote text not null check (char_length(btrim(quote)) between 1 and 600),
  client_name text not null check (char_length(btrim(client_name)) between 1 and 120),
  client_role text check (client_role is null or char_length(client_role) <= 80),
  given_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists testimonials_profile_idx on public.testimonials (profile_id, created_at desc);

alter table public.testimonials enable row level security;

drop policy if exists testimonials_public_read on public.testimonials;
create policy testimonials_public_read on public.testimonials
  for select
  to anon, authenticated
  using (true);

drop policy if exists testimonials_owner_insert on public.testimonials;
create policy testimonials_owner_insert on public.testimonials
  for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and status = 'approved'
    )
  );

drop policy if exists testimonials_owner_update on public.testimonials;
create policy testimonials_owner_update on public.testimonials
  for update
  to authenticated
  using (
    profile_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and status = 'approved'
    )
  )
  with check (
    profile_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and status = 'approved'
    )
  );

drop policy if exists testimonials_owner_delete on public.testimonials;
create policy testimonials_owner_delete on public.testimonials
  for delete
  to authenticated
  using (
    profile_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and status = 'approved'
    )
  );

grant select on public.testimonials to anon, authenticated;
grant insert, update, delete on public.testimonials to authenticated;
