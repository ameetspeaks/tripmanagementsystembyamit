create table if not exists public.integration_tokens (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  token_type text not null,
  token_value text not null,
  expires_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists integration_tokens_unique_active on public.integration_tokens (lower(provider), lower(token_type)) where active;

drop trigger if exists integration_tokens_set_updated_at on public.integration_tokens;
create trigger integration_tokens_set_updated_at before update on public.integration_tokens for each row execute function public.set_updated_at();

alter table public.integration_tokens enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='integration_tokens' and policyname='Allow authenticated read') then
    create policy "Allow authenticated read" on public.integration_tokens for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='integration_tokens' and policyname='Allow authenticated insert') then
    create policy "Allow authenticated insert" on public.integration_tokens for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='integration_tokens' and policyname='Allow authenticated update') then
    create policy "Allow authenticated update" on public.integration_tokens for update to authenticated using (true) with check (true);
  end if;
end $$;
