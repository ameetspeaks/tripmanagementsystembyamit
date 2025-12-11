alter table public.tracking_assets add column if not exists vehicle_id uuid references public.vehicles(id);
alter table public.tracking_assets add column if not exists driver_id uuid references public.drivers(id);
