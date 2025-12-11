create table if not exists public.vehicle_types (
  id uuid primary key default gen_random_uuid(),
  type_name text not null,
  length_m double precision not null,
  breadth_m double precision not null,
  height_m double precision not null,
  weight_load_capacity_tons double precision not null,
  volume_load_capacity_cum double precision not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists vehicle_types_type_unique on public.vehicle_types (lower(type_name));

drop trigger if exists vehicle_types_set_updated_at on public.vehicle_types;
create trigger vehicle_types_set_updated_at before update on public.vehicle_types for each row execute function public.set_updated_at();

alter table public.vehicle_types enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='vehicle_types' and policyname='Allow authenticated read') then
    create policy "Allow authenticated read" on public.vehicle_types for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='vehicle_types' and policyname='Allow authenticated insert') then
    create policy "Allow authenticated insert" on public.vehicle_types for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='vehicle_types' and policyname='Allow authenticated update') then
    create policy "Allow authenticated update" on public.vehicle_types for update to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='vehicle_types' and policyname='Allow authenticated delete') then
    create policy "Allow authenticated delete" on public.vehicle_types for delete to authenticated using (true);
  end if;
end $$;
