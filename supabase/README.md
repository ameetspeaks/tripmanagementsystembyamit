Apply migrations using either the Supabase SQL editor or the Supabase CLI.

SQL Editor:
- Open your Supabase project → SQL → paste the contents of each migration file and run.

CLI:
- Place these files under `supabase/migrations/` in a Supabase CLI project and run `supabase db push`.

Tables created:
- `public.customers` with validation constraints and partial unique indexes on active records.
- `public.profiles` mapped to `auth.users` with RLS policies for authenticated users.
