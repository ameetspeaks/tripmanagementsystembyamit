# Vehicle Type Master

## Database
- Table: `public.vehicle_types` with unique `type_name`, dimensional and capacity fields, RLS

## Frontend
- List: `src/pages/VehicleTypeMaster.tsx`
- Form: `src/pages/vehicle-types/VehicleTypeFormPage.tsx`
- Service/Model: `src/services/vehicleTypeService.ts`, `src/models/vehicleType.ts`

## Migrations
- `supabase/migrations/2025-12-11_0007_vehicle_types.sql`
