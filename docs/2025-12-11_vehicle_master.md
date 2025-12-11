# Vehicle Master

## Database
- Table: `public.vehicles` with unique active vehicle number, compliance docs, RLS
- Constraints: expiry dates cannot be past date
- Relationship: optional `transporter_id` (parent entity); vehicle types via `vehicle_type_id`

## Frontend
- List: `src/pages/VehicleMaster.tsx` fetches from Supabase, delete wired
- Form: `src/pages/vehicles/VehicleFormPage.tsx` updated to spec (tracking asset, dedicated, location, integration, compliance docs)
- Service/Model: `src/services/vehicleService.ts`, `src/models/vehicle.ts`

## Migrations
- `supabase/migrations/2025-12-11_0008_vehicles.sql`
- `supabase/migrations/2025-12-11_0009_drivers_add_transporter.sql` (drivers link to transporters)
