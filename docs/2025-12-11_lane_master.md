# Lane Master

## Database
- Table: `public.lanes` captures lane metadata, map JSON, distance, RLS
- Sub-table: `public.lanes_routes` stores polyline and directions payload variants

## Frontend
- List: `src/pages/Lanes.tsx` now fetches from Supabase and supports delete
- Form: `src/pages/lanes/LaneFormPage.tsx` integrates Google Geocode/Directions:
  - Geocode origin/destination and auto-save in Location Master
  - Compute distance and store polyline and raw directions
  - Persist lane and optional `lanes_routes`
- Services/Model: `src/services/laneService.ts`, `src/models/lane.ts`, `src/services/mapsService.ts`

## Migrations
- `supabase/migrations/2025-12-11_0005_lanes.sql`
