alter table public.drivers add column if not exists transporter_id uuid references public.transporters(id);
