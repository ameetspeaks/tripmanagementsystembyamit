create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_bulk text not null check (is_bulk in ('Y','N')),
  code text not null,
  description text,
  sku_code text not null,
  packaging text not null,
  units text not null,
  height_cm double precision,
  width_cm double precision,
  length_cm double precision,
  weight double precision not null,
  weight_uom text not null,
  volume double precision not null,
  volume_uom text not null,
  status text not null default 'Active' check (status in ('Active','Inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists shipments_code_unique on public.shipments (lower(code));
create unique index if not exists shipments_sku_packaging_unique on public.shipments (lower(sku_code), lower(packaging));

-- Bulk threshold rule (default 100 units): configurable later via settings
alter table public.shipments add constraint shipments_bulk_threshold check (
  (is_bulk = 'Y' and weight >= 100) or (is_bulk = 'N' and weight < 100)
);

drop trigger if exists shipments_set_updated_at on public.shipments;
create trigger shipments_set_updated_at before update on public.shipments for each row execute function public.set_updated_at();

alter table public.shipments enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='shipments' and policyname='Allow authenticated read') then
    create policy "Allow authenticated read" on public.shipments for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='shipments' and policyname='Allow authenticated insert') then
    create policy "Allow authenticated insert" on public.shipments for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='shipments' and policyname='Allow authenticated update') then
    create policy "Allow authenticated update" on public.shipments for update to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='shipments' and policyname='Allow authenticated delete') then
    create policy "Allow authenticated delete" on public.shipments for delete to authenticated using (true);
  end if;
end $$;
