create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.drivers(id) on delete cascade,
  msisdn text not null,
  status text not null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_consents_driver on public.consents(driver_id);
create index if not exists idx_consents_status on public.consents(status);

-- Trigger to mirror consent status on drivers table
create or replace function public.sync_driver_consent_status()
returns trigger as $$
begin
  update public.drivers set consent_status = new.status, updated_at = now() where id = new.driver_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_driver_consent on public.consents;
create trigger trg_sync_driver_consent
after insert or update on public.consents
for each row execute procedure public.sync_driver_consent_status();
