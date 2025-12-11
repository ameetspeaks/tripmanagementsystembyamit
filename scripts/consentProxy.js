import 'dotenv/config';
import { createServer } from 'http';
import { URL } from 'url';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing Supabase env');
  process.exit(1);
}
const supabase = createClient(url, key);

async function getToken(provider, tokenType) {
  const { data } = await supabase
    .from('integration_tokens')
    .select('token_value, expires_at')
    .eq('provider', provider)
    .eq('token_type', tokenType)
    .eq('active', true)
    .order('expires_at', { ascending: false })
    .limit(1);
  if (!data || !data.length) return null;
  return { token: data[0].token_value, expiresAt: data[0].expires_at };
}

async function proxyConsent(msisdn) {
  const tok = await getToken('telenity', 'consent');
  if (!tok) return { status: 500, body: { error: 'No consent token' } };
  const res = await fetch(`https://india-agw.telenity.com/apigw/NOFBconsent/v1/NOFBconsent?address=tel:+${msisdn}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Accept: '*/*', Authorization: `bearer ${tok.token}` },
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { raw: text }; }
  return { status: res.status, body };
}

async function proxyLocation(msisdn) {
  const tok = await getToken('telenity', 'auth');
  if (!tok) return { status: 500, body: { error: 'No auth token' } };
  const res = await fetch(`https://smarttrail.telenity.com/trail-rest/location/msisdnList/${msisdn}?lastResult=true`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `bearer ${tok.token}` },
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { raw: text }; }
  return { status: res.status, body };
}

async function proxyImport(msisdn, firstName, lastName) {
  const tok = await getToken('telenity', 'auth');
  if (!tok) return { status: 500, body: { error: 'No auth token' } };
  const res = await fetch('https://smarttrail.telenity.com/trail-rest/entities/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `bearer ${tok.token}` },
    body: JSON.stringify({ entityImportList: [{ firstName, lastName, msisdn }] }),
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { raw: text }; }
  return { status: res.status, body };
}

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  const u = new URL(req.url, 'http://localhost');
  try {
    if (u.pathname === '/consent') {
      const msisdn = u.searchParams.get('msisdn');
      const out = await proxyConsent(msisdn);
      res.statusCode = out.status;
      res.end(JSON.stringify(out.body));
      return;
    }
    if (u.pathname === '/location') {
      const msisdn = u.searchParams.get('msisdn');
      const out = await proxyLocation(msisdn);
      res.statusCode = out.status;
      res.end(JSON.stringify(out.body));
      return;
    }
    if (u.pathname === '/import') {
      const msisdn = u.searchParams.get('msisdn');
      const firstName = u.searchParams.get('firstName') || 'Driver';
      const lastName = u.searchParams.get('lastName') || '';
      const out = await proxyImport(msisdn, firstName, lastName);
      res.statusCode = out.status;
      res.end(JSON.stringify(out.body));
      return;
    }
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 9091;
server.listen(PORT, () => {
  console.log(`Consent proxy running on http://localhost:${PORT}`);
});
