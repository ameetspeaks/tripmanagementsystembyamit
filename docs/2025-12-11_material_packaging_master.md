# Material / Packaging Master

## Database
- Table: `public.shipments` with unique `code` and composite unique `(sku_code, packaging)`
- Bulk threshold check: `is_bulk='Y'` requires `weight >= 100` (configurable later)
- RLS enabled, `updated_at` trigger maintained

## Frontend
- Schema: `src/lib/schemas.ts` already defines `shipmentSchema`
- List: `src/pages/Shipments.tsx` now fetches from Supabase, delete wired
- Form: `src/pages/shipments/ShipmentFormPage.tsx` create/update with client-side bulk threshold check
- Services/Model: `src/services/shipmentService.ts`, `src/models/shipment.ts`

## Migrations
- `supabase/migrations/2025-12-11_0010_shipments.sql`
