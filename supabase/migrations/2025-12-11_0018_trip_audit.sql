create table if not exists public.trip_audit (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  event text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table public.trip_audit enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trip_audit' and policyname='Allow authenticated read') then
    create policy "Allow authenticated read" on public.trip_audit for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trip_audit' and policyname='Allow authenticated insert') then
    create policy "Allow authenticated insert" on public.trip_audit for insert to authenticated with check (true);
  end if;
end $$;
