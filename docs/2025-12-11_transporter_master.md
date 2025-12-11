# Transporter Master

## Database
- Table: `public.transporters` with unique `code`, partial unique on email/mobile for active, GST/PAN format checks, RLS

## Frontend
- List: `src/pages/TransporterMaster.tsx` via React Query, delete wired
- Form: `src/pages/transporters/TransporterFormPage.tsx` create/update basic fields
- Service/Model: `src/services/transporterService.ts`, `src/models/transporter.ts`

## Migrations
- `supabase/migrations/2025-12-11_0006_transporters.sql`
