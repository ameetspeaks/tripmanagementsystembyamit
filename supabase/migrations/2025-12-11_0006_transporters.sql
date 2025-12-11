create table if not exists public.transporters (
  id uuid primary key default gen_random_uuid(),
  transporter_name text not null,
  code text not null,
  email text,
  mobile text,
  company text,
  address text,
  gstin text,
  pan text,
  is_active text not null default 'Y' check (is_active in ('Y','N')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists transporters_code_unique on public.transporters (lower(code));
create unique index if not exists transporters_unique_email_active on public.transporters (lower(email)) where is_active = 'Y' and email is not null;
create unique index if not exists transporters_unique_mobile_active on public.transporters (mobile) where is_active = 'Y' and mobile is not null;

alter table public.transporters add constraint transporters_gstin_format check (gstin is null or gstin ~ '^[A-Za-z0-9]{15}$');
alter table public.transporters add constraint transporters_pan_format check (pan is null or pan ~ '^[A-Za-z0-9]{10}$');

drop trigger if exists transporters_set_updated_at on public.transporters;
create trigger transporters_set_updated_at before update on public.transporters for each row execute function public.set_updated_at();

alter table public.transporters enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='transporters' and policyname='Allow authenticated read') then
    create policy "Allow authenticated read" on public.transporters for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='transporters' and policyname='Allow authenticated insert') then
    create policy "Allow authenticated insert" on public.transporters for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='transporters' and policyname='Allow authenticated update') then
    create policy "Allow authenticated update" on public.transporters for update to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='transporters' and policyname='Allow authenticated delete') then
    create policy "Allow authenticated delete" on public.transporters for delete to authenticated using (true);
  end if;
end $$;
