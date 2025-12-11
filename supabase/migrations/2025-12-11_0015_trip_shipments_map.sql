create table if not exists public.trip_shipments_map (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  shipment_id uuid not null references public.shipments(id),
  pickup_point_code text not null,
  drop_point_code text not null,
  consignee_code text not null,
  order_id text not null,
  quantity double precision,
  weight double precision,
  volume double precision,
  status text not null default 'Mapped' check (status in ('Mapped','Delivered','NDR','Returned')),
  created_at timestamptz not null default now()
);

create unique index if not exists trip_shipments_unique_combo on public.trip_shipments_map (lower(pickup_point_code), lower(drop_point_code), lower(consignee_code), lower(order_id));

alter table public.trip_shipments_map enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trip_shipments_map' and policyname='Allow authenticated read') then
    create policy "Allow authenticated read" on public.trip_shipments_map for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trip_shipments_map' and policyname='Allow authenticated insert') then
    create policy "Allow authenticated insert" on public.trip_shipments_map for insert to authenticated with check (true);
  end if;
end $$;
