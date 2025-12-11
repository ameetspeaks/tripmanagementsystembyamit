create table if not exists public.sim_tracking_settings (
  id uuid primary key default gen_random_uuid(),
  authorization_token text not null,
  consent_auth_token text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sim_tracking_settings_active on public.sim_tracking_settings (is_active);

-- Seed single row if none exists
insert into public.sim_tracking_settings (authorization_token, consent_auth_token, is_active)
select coalesce(nullif(current_setting('app.authorization_token', true), ''), ''), coalesce(nullif(current_setting('app.consent_auth_token', true), ''), ''), true
where not exists (select 1 from public.sim_tracking_settings);
