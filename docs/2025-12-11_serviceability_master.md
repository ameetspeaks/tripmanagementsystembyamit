# Serviceability Master (Lanes)

## Database
- Table: `public.serviceability_lanes` capturing lane code, freight type, mode, transporter code, vehicle type, TATs
- Unique `lane_code`, RLS and `updated_at` trigger enabled

## Frontend
- List: `src/pages/ServiceabilityMaster.tsx`
- Form: `src/pages/serviceability/ServiceabilityFormPage.tsx`
- Services/Model: `src/services/serviceabilityService.ts`, `src/models/serviceability.ts`

## Migrations
- `supabase/migrations/2025-12-11_0011_serviceability_lanes.sql`
