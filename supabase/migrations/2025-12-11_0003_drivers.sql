-- Driver Master
create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mobile_number text not null,
  is_dedicated text not null check (is_dedicated in ('Y','N')),
  location_code text,
  license_number text not null,
  license_issue_date date,
  license_expiry_date date not null,
  aadhaar_number text,
  pan_number text,
  voter_id_number text,
  passport_number text,
  police_verification_number text,
  police_verification_issue_date date,
  police_verification_expiry_date date,
  consent_status text not null default 'Pending' check (consent_status in ('Pending','Approved','Revoked')),
  status text not null default 'Active' check (status in ('Active','Inactive','Pending')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique mobile across active drivers
create unique index if not exists drivers_unique_mobile_active on public.drivers (lower(mobile_number)) where active;

-- PAN format constraint (optional)
alter table public.drivers add constraint drivers_pan_format check (pan_number is null or pan_number ~ '^[A-Za-z0-9]{10}$');

-- License expiry cannot be past date
alter table public.drivers add constraint drivers_license_expiry_future check (license_expiry_date >= current_date);

-- updated_at trigger
drop trigger if exists drivers_set_updated_at on public.drivers;
create trigger drivers_set_updated_at before update on public.drivers for each row execute function public.set_updated_at();

-- RLS
alter table public.drivers enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='drivers' and policyname='Allow authenticated read') then
    create policy "Allow authenticated read" on public.drivers for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='drivers' and policyname='Allow authenticated insert') then
    create policy "Allow authenticated insert" on public.drivers for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='drivers' and policyname='Allow authenticated update') then
    create policy "Allow authenticated update" on public.drivers for update to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='drivers' and policyname='Allow authenticated delete') then
    create policy "Allow authenticated delete" on public.drivers for delete to authenticated using (true);
  end if;
end $$;
