-- Customer / Consignee Master
create extension if not exists pgcrypto;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  company_name text not null,
  email text,
  gst_number text,
  pan_number text,
  phone_number text not null,
  address text not null,
  integration_code text,
  secondary_email text,
  secondary_phone_number text,
  status text not null default 'Active' check (status in ('Active','Inactive','Pending')),
  consignee_code text unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers add constraint customers_gst_format check (gst_number is null or gst_number ~ '^[A-Za-z0-9]{15}$');
alter table public.customers add constraint customers_pan_format check (pan_number is null or pan_number ~ '^[A-Za-z0-9]{10}$');

create unique index if not exists customers_unique_email_active on public.customers (lower(email)) where active and email is not null;
create unique index if not exists customers_unique_phone_active on public.customers (phone_number) where active;

create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at before update on public.customers for each row execute function public.set_updated_at();

alter table public.customers enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='customers' and policyname='Allow authenticated read') then
    create policy "Allow authenticated read" on public.customers for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='customers' and policyname='Allow authenticated insert') then
    create policy "Allow authenticated insert" on public.customers for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='customers' and policyname='Allow authenticated update') then
    create policy "Allow authenticated update" on public.customers for update to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='customers' and policyname='Allow authenticated delete') then
    create policy "Allow authenticated delete" on public.customers for delete to authenticated using (true);
  end if;
end $$;
