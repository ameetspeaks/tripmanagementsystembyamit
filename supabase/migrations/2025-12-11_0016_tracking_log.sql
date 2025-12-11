create table if not exists public.tracking_log (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  source text not null check (source in ('GPS','SIM','Manual')),
  latitude double precision not null,
  longitude double precision not null,
  accuracy_m double precision,
  event_time timestamptz not null,
  raw jsonb,
  created_at timestamptz not null default now()
);

alter table public.tracking_log enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tracking_log' and policyname='Allow authenticated read') then
    create policy "Allow authenticated read" on public.tracking_log for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tracking_log' and policyname='Allow authenticated insert') then
    create policy "Allow authenticated insert" on public.tracking_log for insert to authenticated with check (true);
  end if;
end $$;
