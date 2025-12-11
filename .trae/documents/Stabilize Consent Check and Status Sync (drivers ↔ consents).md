## Problems Identified
- Inconsistent status vocabulary between Telenity (ALLOWED/DENIED/PENDING) and app (Approved/Revoked/Pending) causes drivers.consent_status to drift.
- Trigger on consents mirrors raw status into drivers without mapping.
- Frontend previously hit a local proxy; now needs to rely on DB updates. Manual refresh/timer should read from `consents` only, and never write to `drivers` directly.
- Background job updates both tables in different places, risking conflicts.

## Target State
- Single source of truth: `consents.status` stores raw Telenity statuses (ALLOWED/DENIED/PENDING).
- `drivers.consent_status` always stores normalized app statuses (Approved/Revoked/Pending) via a mapping trigger only.
- Background job only upserts `consents`; it never writes to `drivers`.
- Frontend reads `drivers.consent_status` for display, and reads `consents.status` for detailed checks, with manual refresh and 60s polling.
- No localhost proxy usage anywhere; all network calls to Telenity happen in backend jobs.

## Changes (DB)
1. Update trigger on `public.consents` to translate raw → normalized:
   - ALLOWED → Approved
   - DENIED → Revoked
   - PENDING/Pending → Pending
   - Unknown → Pending (default)
2. Set trigger function as SECURITY DEFINER to avoid RLS issues when the app (anon) inserts/updates `consents`.
3. Optional: add a check constraint or enum for `consents.status` to accept only the expected provider codes.

## Changes (Backend Jobs)
4. In `scripts/pollConsentAndLocation.js`:
   - When Import/Consent responses arrive, upsert only into `consents` with raw provider status; remove any direct `drivers` updates.
   - Keep Location API logging as-is once status is ALLOWED.
5. In `scripts/refreshTokens.js`: no change (already fixed for POST and IST expiry).

## Changes (Frontend)
6. In `/trips/add` (TripFormPage):
   - Remove any code paths that write to `drivers.consent_status` on the client.
   - Consent display logic:
     - Display `drivers.consent_status` (Approved/Revoked/Pending) for user-friendly status.
     - If Pending: show a 60s polling loop to read `consents.status` and reflect mapped status via the trigger automatically.
     - Keep a Refresh button that reads `consents.status` and updates the local UI only.
   - Trigger Import button:
     - Keep calling the Telenity host URL; on CORS, show a toast and rely on the background job.
     - Immediately upsert a `consents` row with status PENDING (if not present) so the UI displays Pending and polling starts.

## Validation
7. Seed a test driver with `consent_status='Pending'`, run `refresh-tokens`, then run `pollConsentAndLocation` once to confirm:
   - `consents.status` becomes ALLOWED/DENIED per provider; 
   - Trigger maps `drivers.consent_status` to Approved/Revoked/Pending;
   - Trip form shows the normalized status and proceeds/blocks accordingly.
8. Verify no 9091 calls remain. Confirm Create Trip works when status is Approved and warns but proceeds when Pending.

## Deliverables
- Migration updating trigger function on `consents` with mapping + SECURITY DEFINER
- Updated background job to write only to `consents`
- Updated TripFormPage to stop writing to `drivers` and to poll/refresh `consents` only
- Short README snippet describing status mapping and flow

Proceed with these changes?