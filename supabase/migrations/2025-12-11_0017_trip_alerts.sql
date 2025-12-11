create table if not exists public.trip_alerts (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  alert_type text not null check (alert_type in ('RouteDeviation','IdleDetention','Delay','ConsentRevoked','NoPing')),
  severity text not null default 'Medium' check (severity in ('Low','Medium','High')),
  message text,
  triggered_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.trip_alerts enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trip_alerts' and policyname='Allow authenticated read') then
    create policy "Allow authenticated read" on public.trip_alerts for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trip_alerts' and policyname='Allow authenticated insert') then
    create policy "Allow authenticated insert" on public.trip_alerts for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trip_alerts' and policyname='Allow authenticated update') then
    create policy "Allow authenticated update" on public.trip_alerts for update to authenticated using (true) with check (true);
  end if;
end $$;
