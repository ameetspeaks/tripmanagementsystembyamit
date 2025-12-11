# TripMS System Overview

## Modules
- Masters: Transporters, Vehicle Types, Vehicles, Drivers, Locations, Lanes, Shipments (Material/Packaging), Tracking Assets, Serviceability
- Trips: Trip creation, shipment mapping, tracking, alerts, audit, closure
- Integrations: Google Geocoding/Directions, Telenity SIM tracking (Auth, Consent, Import, Location)

## Database Schema (Supabase)
- `transporters`: name, code, email/mobile, GST/PAN, is_active
- `vehicle_types`: type_name, dimensions (m), capacities (tons/m³)
- `vehicles`: vehicle_number (unique active), type_id, tracking_asset, dedicated, location_code, integration_code, compliance docs, status
- `drivers`: core driver info, consent_status, RLS
- `locations`: address, location_name, radii, lat/lng, type, city/state/pincode, status
- `lanes`: lane_type, mode_of_transport, origin_name, destination_name, lane_name, lane_code (unique), distance_km, map_json, lane_status, lane_price
- `lanes_routes`: per-lane polyline and route JSON variants
- `shipments`: name, is_bulk, code (unique), description, sku_code, packaging, units, dimensions (cm), weight + uom, volume + uom, status; unique `(sku_code, packaging)`; bulk threshold check
- `serviceability_lanes`: lane_code (unique), freight_type_code, mode, transporter_code, vehicle_type_code, standard_tat, express_tat
- `tracking_assets`: display_name, asset_type (SIM/GPS/DriverApp), url/token/response_json (optional), transporter_id, asset_id (unique), driver_id, vehicle_id, status
- `trips`: trip_id (unique), lane_id, origin_name, destination_name, vehicle_id, driver_id, transporter_id, vehicle_number, driver_name, driver_number, consignee_name, transporter_name, tracking_type, is_tracked, status, start_time, end_time
- `trip_shipments_map`: trip_id, shipment_id, pickup_point_code, drop_point_code, consignee_code, order_id (unique combo), quantities
- `tracking_log`: trip_id, source (GPS/SIM/Manual), lat/lng, accuracy, event_time, raw
- `trip_alerts`: trip_id, alert_type, severity, message, triggered_at, resolved_at
- `trip_audit`: trip_id, event, details JSON
- `integration_tokens`: provider + token_type (unique active), token_value, expires_at

## Frontend Integration
- React + shadcn UI + TanStack Query, Supabase client
- Lists wired with delete and query invalidation; forms create/update with validation populated from Zod schemas
- Google APIs used in LaneForm for geocoding/directions
- Telenity service layer:
  - Auth GET `https://smarttrail.telenity.com/trail-rest/login` (Basic)
  - Consent token POST `https://india-agw.telenity.com/oauth/token?grant_type=client_credentials` (Basic)
  - Import entity POST, Location GET, Consent Check GET

## Jobs & Scheduling
- Node scripts: `scripts/refreshTokens.js`, `scripts/pollConsentAndLocation.js`
- GitHub Actions workflow `.github/workflows/telenity-cron.yml`:
  - `refresh-tokens` every 6h – stores `auth` and `consent` tokens in `integration_tokens`
  - `poll-consent-and-location` every 5m – logs SIM location for ongoing/created SIM-tracked trips

## Trip Workflow
1. Trip Creation: validate masters, unique id, lane, tracking asset presence based on tracking type; status `Created`
2. Shipment Mapping: enforce unique combo and single active trip per shipment; status on map `Mapped`
3. Trip Start: manual or geofence; status `Ongoing`; tracking activated
4. Tracking & Monitoring: GPS preferred; fallback SIM; manual updates; alerts on deviations/idle/delay/no-ping
5. Exceptions: vehicle/driver switch with audit; shipment exceptions; breakdown handling
6. Completion: status `Completed`; POD attach
7. Closure: final validations; status `Closed`

## Environment
- `/.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_MAPS_API_KEY`, `AUTHORIZATION_TOKEN`, `CONSENT_AUTH_TOKEN`

## Notes
- All tables have RLS and updated_at triggers
- Consent OAuth requires POST; Location API bearer uses Auth token; msisdn formatted as `91{mobile}`
