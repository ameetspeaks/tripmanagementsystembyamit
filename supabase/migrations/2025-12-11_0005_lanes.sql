create table if not exists public.lanes (
  id uuid primary key default gen_random_uuid(),
  lane_type text not null check (lane_type in ('Point to Point','Area to Area','City to City')),
  mode_of_transport text not null default 'Road' check (mode_of_transport in ('Road','Rail','Air')),
  origin_name text not null,
  destination_name text not null,
  lane_name text not null,
  lane_code text not null,
  integration_id text,
  distance_km double precision not null,
  map_json jsonb,
  lane_status text not null default 'Active' check (lane_status in ('Active','Inactive')),
  lane_price double precision,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists lanes_lane_code_unique on public.lanes (lower(lane_code));

drop trigger if exists lanes_set_updated_at on public.lanes;
create trigger lanes_set_updated_at before update on public.lanes for each row execute function public.set_updated_at();

alter table public.lanes enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='lanes' and policyname='Allow authenticated read') then
    create policy "Allow authenticated read" on public.lanes for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='lanes' and policyname='Allow authenticated insert') then
    create policy "Allow authenticated insert" on public.lanes for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='lanes' and policyname='Allow authenticated update') then
    create policy "Allow authenticated update" on public.lanes for update to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='lanes' and policyname='Allow authenticated delete') then
    create policy "Allow authenticated delete" on public.lanes for delete to authenticated using (true);
  end if;
end $$;

-- Optional: store multiple route variants per lane
create table if not exists public.lanes_routes (
  id uuid primary key default gen_random_uuid(),
  lane_id uuid not null references public.lanes(id) on delete cascade,
  route_mode text not null, -- e.g., driving, transit_bus
  polyline text, -- encoded polyline
  raw_json jsonb, -- full directions payload if needed
  distance_meters integer,
  duration_seconds integer,
  created_at timestamptz not null default now()
);

alter table public.lanes_routes enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='lanes_routes' and policyname='Allow authenticated read') then
    create policy "Allow authenticated read" on public.lanes_routes for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='lanes_routes' and policyname='Allow authenticated insert') then
    create policy "Allow authenticated insert" on public.lanes_routes for insert to authenticated with check (true);
  end if;
end $$;
