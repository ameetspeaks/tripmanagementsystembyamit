create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  location_name text not null,
  consignee_code text,
  consignee_name text,
  sim_radius integer not null default 5000,
  gps_radius integer not null default 500,
  latitude double precision,
  longitude double precision,
  location_type text not null check (location_type in ('Node','Consignee','Plant','Warehouse')),
  city_name text not null,
  pincode text not null,
  state_name text not null,
  district text,
  zone text,
  taluka text,
  area_office text,
  integration_id text,
  status text not null default 'Active' check (status in ('Active','Inactive')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists locations_location_name_unique on public.locations (lower(location_name));

alter table public.locations add constraint locations_pincode_format check (pincode ~ '^\d{6}$');
alter table public.locations add constraint locations_radius_positive check (sim_radius >= 0 and gps_radius >= 0);
alter table public.locations add constraint locations_node_requires_latlng check (
  location_type <> 'Node' or (latitude is not null and longitude is not null)
);

drop trigger if exists locations_set_updated_at on public.locations;
create trigger locations_set_updated_at before update on public.locations for each row execute function public.set_updated_at();

alter table public.locations enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='locations' and policyname='Allow authenticated read') then
    create policy "Allow authenticated read" on public.locations for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='locations' and policyname='Allow authenticated insert') then
    create policy "Allow authenticated insert" on public.locations for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='locations' and policyname='Allow authenticated update') then
    create policy "Allow authenticated update" on public.locations for update to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='locations' and policyname='Allow authenticated delete') then
    create policy "Allow authenticated delete" on public.locations for delete to authenticated using (true);
  end if;
end $$;
