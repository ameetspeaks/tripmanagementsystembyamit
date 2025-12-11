# Tracking Assets Master

## Database
- Table: `public.tracking_assets` with `asset_type (SIM/GPS/DriverApp)`, `url`, `token`, `response_json`, `transporter_id`, `asset_id (unique)`, `status`
- RLS and `updated_at` trigger enabled

## Frontend
- List: `src/pages/TrackingAsset.tsx` now fetches from Supabase and supports delete
- Form: `src/pages/tracking-assets/TrackingAssetFormPage.tsx` create/update
- Services/Model: `src/services/trackingAssetService.ts`, `src/models/trackingAsset.ts`

## Migrations
- `supabase/migrations/2025-12-11_0012_tracking_assets.sql`
