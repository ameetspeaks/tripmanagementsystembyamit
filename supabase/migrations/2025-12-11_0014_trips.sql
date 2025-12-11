create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null,
  lane_id uuid not null references public.lanes(id),
  origin_name text not null,
  destination_name text not null,
  vehicle_id uuid not null references public.vehicles(id),
  driver_id uuid not null references public.drivers(id),
  transporter_id uuid references public.transporters(id),
  vehicle_number text not null,
  driver_name text not null,
  driver_number text not null,
  consignee_name text not null,
  transporter_name text not null,
  tracking_type text not null check (tracking_type in ('GPS','SIM','Manual')),
  is_tracked boolean not null default true,
  status text not null default 'Created' check (status in ('Created','Ongoing','Completed','Closed','OnHold','Cancelled')),
  start_time timestamptz,
  end_time timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists trips_trip_id_unique on public.trips (lower(trip_id));

drop trigger if exists trips_set_updated_at on public.trips;
create trigger trips_set_updated_at before update on public.trips for each row execute function public.set_updated_at();

alter table public.trips enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trips' and policyname='Allow authenticated read') then
    create policy "Allow authenticated read" on public.trips for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trips' and policyname='Allow authenticated insert') then
    create policy "Allow authenticated insert" on public.trips for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trips' and policyname='Allow authenticated update') then
    create policy "Allow authenticated update" on public.trips for update to authenticated using (true) with check (true);
  end if;
end $$;
