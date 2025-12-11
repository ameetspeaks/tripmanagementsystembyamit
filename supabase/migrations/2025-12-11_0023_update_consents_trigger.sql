create or replace function public.sync_driver_consent_status()
returns trigger
language plpgsql
security definer
as $$
declare mapped text;
begin
  mapped := case upper(new.status)
    when 'ALLOWED' then 'Approved'
    when 'DENIED' then 'Revoked'
    when 'PENDING' then 'Pending'
    else 'Pending'
  end;
  update public.drivers set consent_status = mapped, updated_at = now() where id = new.driver_id;
  return new;
end;
$$;

drop trigger if exists trg_sync_driver_consent on public.consents;
create trigger trg_sync_driver_consent
after insert or update on public.consents
for each row execute procedure public.sync_driver_consent_status();

