# Location Master

## Database
- Table: `public.locations` with unique `location_name`, radius defaults, RLS
- Constraints: node requires lat/lng; pincode 6 digits

## Frontend
- Schema: `src/lib/schemas.ts` extended for full location fields
- List: `src/pages/Locations.tsx` with delete and React Query
- Services/Model: `src/services/locationService.ts`, `src/models/location.ts`
- Sidebar & Routes wired in `src/components/layout/AppSidebar.tsx` and `src/App.tsx`

## Migrations
- `supabase/migrations/2025-12-11_0004_locations.sql`
