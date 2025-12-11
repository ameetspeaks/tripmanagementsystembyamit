create table if not exists public.serviceability_lanes (
  id uuid primary key default gen_random_uuid(),
  lane_code text not null,
  freight_type_code text not null, -- FTL/PTL/Express
  serviceability_mode text not null, -- Surface/Air/Rail
  transporter_code text,
  vehicle_type_code text not null,
  standard_tat integer not null, -- hours
  express_tat integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists serviceability_lane_code_unique on public.serviceability_lanes (lower(lane_code));

drop trigger if exists serviceability_lanes_set_updated_at on public.serviceability_lanes;
create trigger serviceability_lanes_set_updated_at before update on public.serviceability_lanes for each row execute function public.set_updated_at();

alter table public.serviceability_lanes enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='serviceability_lanes' and policyname='Allow authenticated read') then
    create policy "Allow authenticated read" on public.serviceability_lanes for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='serviceability_lanes' and policyname='Allow authenticated insert') then
    create policy "Allow authenticated insert" on public.serviceability_lanes for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='serviceability_lanes' and policyname='Allow authenticated update') then
    create policy "Allow authenticated update" on public.serviceability_lanes for update to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='serviceability_lanes' and policyname='Allow authenticated delete') then
    create policy "Allow authenticated delete" on public.serviceability_lanes for delete to authenticated using (true);
  end if;
end $$;
