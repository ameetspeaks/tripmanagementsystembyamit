# Driver Master

## Database
- Table: `public.drivers` with validations and RLS
- Constraints: unique active mobile, license expiry not past, PAN format
- Consent: `consent_status` with values Pending/Approved/Revoked

## Frontend
- List: `src/pages/Driver.tsx` uses Supabase via React Query, supports delete
- Form: `src/pages/drivers/DriverFormPage.tsx` create/update with validation, initiate consent
- Service: `src/services/driverService.ts`
- Model: `src/models/driver.ts`

## Migrations
- `supabase/migrations/2025-12-11_0003_drivers.sql`
