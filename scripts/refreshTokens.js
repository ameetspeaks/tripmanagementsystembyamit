import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const authorizationToken = (process.env.AUTHORIZATION_TOKEN || '').replace(/^['"]|['"]$/g, '');
const consentAuthToken = (process.env.CONSENT_AUTH_TOKEN || process.env.Consent_AUTH_TOKEN || '').replace(/^['"]|['"]$/g, '');

if (!url || !key || !authorizationToken || !consentAuthToken) {
  console.error('Missing env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function getSettings() {
  const { data } = await supabase
    .from('sim_tracking_settings')
    .select('authorization_token, consent_auth_token')
    .eq('is_active', true)
    .limit(1);
  if (data && data.length) return { authorizationToken: data[0].authorization_token, consentAuthToken: data[0].consent_auth_token };
  return null;
}

async function setToken(provider, tokenType, token, expiresAt) {
  await supabase.from('integration_tokens').update({ active: false }).eq('provider', provider).eq('token_type', tokenType);
  const { error } = await supabase.from('integration_tokens').insert({ provider, token_type: tokenType, token_value: token, expires_at: expiresAt, active: true });
  if (error) throw error;
}

async function getAuthToken(authorizationToken) {
  const res = await fetch('https://smarttrail.telenity.com/trail-rest/login', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${authorizationToken}` },
  });
  if (!res.ok) throw new Error('Telenity auth failed');
  const json = await res.json();
  return { token: json.token, expiresAt: toISTISO(Date.now() + 6 * 60 * 60 * 1000) };
}

async function getConsentAccessToken(consentAuthToken) {
  const res = await fetch('https://india-agw.telenity.com/oauth/token?grant_type=client_credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${consentAuthToken}` },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error('Consent auth failed');
  const json = await res.json();
  const expiresIn = json.expires_in ?? 3600;
  return { accessToken: json.access_token, expiresAt: toISTISO(Date.now() + expiresIn * 1000) };
}

async function run() {
  const settings = await getSettings();
  const authCred = (settings?.authorizationToken || authorizationToken);
  const consentCred = (settings?.consentAuthToken || consentAuthToken);
  const auth = await getAuthToken(authCred);
  await setToken('telenity', 'auth', auth.token, auth.expiresAt);
  const consent = await getConsentAccessToken(consentCred);
  await setToken('telenity', 'consent', consent.accessToken, consent.expiresAt);
  console.log('Tokens refreshed');
}

function toISTISO(ms) {
  const d = new Date(ms);
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const get = (t) => fmt.find(p => p.type === t).value;
  const yyyy = get('year');
  const mm = get('month');
  const dd = get('day');
  const hh = get('hour');
  const mi = get('minute');
  const ss = get('second');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}+05:30`;
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
