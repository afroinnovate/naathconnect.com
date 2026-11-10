-- Ordinary accounts are members. Directory applications stay professionals.
-- Apply in the Supabase SQL editor after review. This file does not run by itself.
-- Nobody is approved by this change. New rows stay status pending.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'professional', 'member'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  account_role text := 'member';
begin
  if new.raw_user_meta_data->>'account_role' = 'professional' then
    account_role := 'professional';
  end if;
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
    account_role,
    '[]'::jsonb,
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.protect_profile()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and auth.uid() is not null and not public.is_admin() then
    new.id := auth.uid();
    new.status := 'pending';
    if new.role is distinct from 'professional' then
      new.role := 'member';
    end if;
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
