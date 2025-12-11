create table if not exists public.tracking_assets (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  asset_type text not null check (asset_type in ('SIM','GPS','DriverApp')),
  url text,
  token text,
  response_json jsonb,
  transporter_id uuid references public.transporters(id),
  asset_id text not null,
  status text not null default 'Active' check (status in ('Active','Inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists tracking_assets_asset_unique on public.tracking_assets (lower(asset_id));

drop trigger if exists tracking_assets_set_updated_at on public.tracking_assets;
create trigger tracking_assets_set_updated_at before update on public.tracking_assets for each row execute function public.set_updated_at();

alter table public.tracking_assets enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tracking_assets' and policyname='Allow authenticated read') then
    create policy "Allow authenticated read" on public.tracking_assets for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tracking_assets' and policyname='Allow authenticated insert') then
    create policy "Allow authenticated insert" on public.tracking_assets for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tracking_assets' and policyname='Allow authenticated update') then
    create policy "Allow authenticated update" on public.tracking_assets for update to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tracking_assets' and policyname='Allow authenticated delete') then
    create policy "Allow authenticated delete" on public.tracking_assets for delete to authenticated using (true);
  end if;
end $$;
