import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE env');
  process.exit(1);
}
const supabase = createClient(url, key);

async function getTrips() {
  const { data, error } = await supabase
    .from('trips')
    .select('id, trip_id, driver_number, status, tracking_type')
    .in('status', ['Created','Ongoing'])
    .eq('tracking_type', 'SIM')
    .limit(100);
  if (error) throw error;
  return data || [];
}

async function listPendingDrivers() {
  const { data, error } = await supabase
    .from('drivers')
    .select('id, name, mobile_number, consent_status')
    .eq('consent_status', 'Pending')
    .limit(100);
  if (error) throw error;
  return data || [];
}

async function importEntities(authToken, entities) {
  const res = await fetch('https://smarttrail.telenity.com/trail-rest/entities/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `bearer ${authToken}` },
    body: JSON.stringify({ entityImportList: entities }),
  });
  if (!res.ok) throw new Error('Import API failed');
  const json = await res.json();
  return json;
}

async function markConsent(driverId, msisdn, status, opts) {
  const { data } = await supabase
    .from('consents')
    .select('id')
    .eq('driver_id', driverId)
    .limit(1);
  if (data && data.length) {
    await supabase
      .from('consents')
      .update({ status, msisdn, expires_at: opts?.expiresAt ?? null, telenity_entity_id: opts?.entityId ?? null, tracked: opts?.tracked ?? null, import_requested: opts?.importRequested ?? false, consent_checked_at: new Date().toISOString() })
      .eq('id', data[0].id);
  } else {
    await supabase
      .from('consents')
      .insert({ driver_id: driverId, status, msisdn, expires_at: opts?.expiresAt ?? null, telenity_entity_id: opts?.entityId ?? null, tracked: opts?.tracked ?? null, import_requested: opts?.importRequested ?? false, consent_checked_at: new Date().toISOString() });
  }
}

async function getToken(provider, tokenType) {
  const { data } = await supabase
    .from('integration_tokens')
    .select('id, token_value, expires_at')
    .eq('provider', provider)
    .eq('token_type', tokenType)
    .eq('active', true)
    .order('expires_at', { ascending: false })
    .limit(1);
  if (!data || data.length === 0) return null;
  return { id: data[0].id, token: data[0].token_value, expiresAt: data[0].expires_at };
}

function isExpired(expiresAt, marginMinutes = 5) {
  const expires = new Date(expiresAt).getTime();
  const now = Date.now() + marginMinutes * 60 * 1000;
  return expires <= now;
}

async function logPoint(tripId, lat, lng, accuracy, eventTime, raw) {
  const { error } = await supabase.from('tracking_log').insert({ trip_id: tripId, source: 'SIM', latitude: lat, longitude: lng, accuracy_m: accuracy ?? null, event_time: eventTime, raw: raw ?? null });
  if (error) throw error;
}

async function checkConsent(msisdn, accessToken) {
  const res = await fetch(`https://india-agw.telenity.com/apigw/NOFBconsent/v1/NOFBconsent?address=tel:+${msisdn}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Accept: '*/*', Authorization: `bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Consent API failed');
  const json = await res.json();
  return json;
}

async function getLocation(msisdn, authToken) {
  const res = await fetch(`https://smarttrail.telenity.com/trail-rest/location/msisdnList/${msisdn}?lastResult=true`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `bearer ${authToken}` },
  });
  if (!res.ok) throw new Error('Location API failed');
  const json = await res.json();
  return json;
}

async function main() {
  const consentToken = await getToken('telenity', 'consent');
  const authToken = await getToken('telenity', 'auth');
  if (!consentToken || !authToken || isExpired(consentToken.expiresAt) || isExpired(authToken.expiresAt)) {
    console.error('Tokens missing/expired; ensure refresh-tokens job runs');
    return;
  }
  // Handle pending consents: trigger Import API
  const pendingDrivers = await listPendingDrivers();
  for (const d of pendingDrivers) {
    try {
      const parts = (d.name || 'Driver').split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ');
      const msisdn = `91${d.mobile_number}`;
      const resp = await importEntities(authToken.token, [{ firstName, lastName, msisdn }]);
      const succ = resp?.successList?.[0];
      await markConsent(d.id, msisdn, 'Pending', { entityId: succ?.entityId ?? null, tracked: succ?.isTracked ?? null, importRequested: true });
      console.log(`Import triggered for driver ${d.mobile_number}`);
    } catch (e) {
      console.error(`Import failed for driver ${d.mobile_number}`, e.message);
    }
  }
  const trips = await getTrips();
  for (const t of trips) {
    const msisdn = `91${t.driver_number}`;
    try {
      const consent = await checkConsent(msisdn, consentToken.token);
      const status = consent?.Consent?.status;
      // Mirror consent status
      const { data: driverRow } = await supabase.from('drivers').select('id').eq('mobile_number', t.driver_number).limit(1);
      if (driverRow && driverRow.length) {
        await markConsent(driverRow[0].id, msisdn, status || 'UNKNOWN', {});
      }
      if (status === 'ALLOWED') {
        const loc = await getLocation(msisdn, authToken.token);
        const term = loc?.terminalLocation?.[0];
        if (term?.currentLocation) {
          const { latitude, longitude, timestamp } = term.currentLocation;
          const accuracy = undefined;
          await logPoint(t.id, latitude, longitude, accuracy, new Date().toISOString(), loc);
          console.log(`Logged SIM point for ${t.trip_id}`);
        }
      } else {
        console.log(`Consent not allowed for ${t.trip_id}`);
      }
    } catch (e) {
      console.error(`Trip ${t.trip_id} error`, e.message);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
