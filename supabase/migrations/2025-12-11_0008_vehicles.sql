create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  vehicle_number text not null,
  vehicle_type_id uuid references public.vehicle_types(id),
  tracking_asset text,
  is_dedicated text not null check (is_dedicated in ('Y','N')),
  location_code text,
  integration_code text,
  transporter_id uuid references public.transporters(id),
  status text not null default 'Active' check (status in ('Active','Inactive','Pending')),
  rc_number text,
  rc_issue_date date,
  rc_expiry_date date,
  puc_number text,
  puc_issue_date date,
  puc_expiry_date date,
  insurance_number text,
  insurance_issue_date date,
  insurance_expiry_date date,
  fitness_number text,
  fitness_issue_date date,
  fitness_expiry_date date,
  permit_number text,
  permit_issue_date date,
  permit_expiry_date date,
  hydraulic_test_number text,
  hydraulic_test_issue_date date,
  hydraulic_test_expiry_date date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists vehicles_unique_number_active on public.vehicles (lower(vehicle_number)) where active;

alter table public.vehicles add constraint vehicles_expiry_future check (
  (rc_expiry_date is null or rc_expiry_date >= current_date) and
  (puc_expiry_date is null or puc_expiry_date >= current_date) and
  (insurance_expiry_date is null or insurance_expiry_date >= current_date) and
  (fitness_expiry_date is null or fitness_expiry_date >= current_date) and
  (permit_expiry_date is null or permit_expiry_date >= current_date) and
  (hydraulic_test_expiry_date is null or hydraulic_test_expiry_date >= current_date)
);

drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at before update on public.vehicles for each row execute function public.set_updated_at();

alter table public.vehicles enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='vehicles' and policyname='Allow authenticated read') then
    create policy "Allow authenticated read" on public.vehicles for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='vehicles' and policyname='Allow authenticated insert') then
    create policy "Allow authenticated insert" on public.vehicles for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='vehicles' and policyname='Allow authenticated update') then
    create policy "Allow authenticated update" on public.vehicles for update to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='vehicles' and policyname='Allow authenticated delete') then
    create policy "Allow authenticated delete" on public.vehicles for delete to authenticated using (true);
  end if;
end $$;
