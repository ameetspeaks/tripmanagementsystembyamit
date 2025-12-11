import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  throw new Error('Missing Supabase env');
}
const supabase = createClient(url, key);

// Token refresh functions (copied from refreshTokens.js)
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

async function setToken(provider, tokenType, token, expiresAt) {
  // First, deactivate all existing tokens of this type
  const { error: updateError } = await supabase
    .from('integration_tokens')
    .update({ active: false })
    .eq('provider', provider)
    .eq('token_type', tokenType);

  if (updateError) {
    console.error('Failed to deactivate existing tokens:', updateError);
    throw updateError;
  }

  // Then insert the new token
  const { error: insertError } = await supabase.from('integration_tokens').insert({
    provider,
    token_type: tokenType,
    token_value: token,
    expires_at: expiresAt,
    active: true
  });

  if (insertError) throw insertError;
}

async function refreshTokensIfNeeded() {
  try {
    // Get settings
    const { data: settings } = await supabase
      .from('sim_tracking_settings')
      .select('authorization_token, consent_auth_token')
      .eq('is_active', true)
      .limit(1);

    if (!settings || !settings.length) {
      console.error('No SIM tracking settings found');
      return false;
    }

    const authCred = settings[0].authorization_token;
    const consentCred = settings[0].consent_auth_token;

    if (!authCred || !consentCred) {
      console.error('Missing auth credentials in settings');
      return false;
    }

    // Refresh tokens
    console.log('Refreshing tokens...');
    const auth = await getAuthToken(authCred);
    await setToken('telenity', 'auth', auth.token, auth.expiresAt);

    const consent = await getConsentAccessToken(consentCred);
    await setToken('telenity', 'consent', consent.accessToken, consent.expiresAt);

    console.log('Tokens refreshed successfully');
    return true;
  } catch (error) {
    console.error('Failed to refresh tokens:', error);
    return false;
  }
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

async function getToken(provider, tokenType) {
  const { data } = await supabase
    .from('integration_tokens')
    .select('token_value, expires_at')
    .eq('provider', provider)
    .eq('token_type', tokenType)
    .eq('active', true)
    .order('expires_at', { ascending: false })
    .limit(1);
  if (!data || !data.length) {
    console.error(`No ${tokenType} token found in database`);
    return null;
  }

  // Check if token is expired or will expire in next 5 minutes
  const expiresAt = new Date(data[0].expires_at);
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  if (expiresAt <= now) {
    console.error(`Token expired: ${expiresAt} <= ${now}`);
    return null;
  }

  if (expiresAt <= fiveMinutesFromNow) {
    console.warn(`Token expires soon: ${expiresAt} <= ${fiveMinutesFromNow}`);
  }

  console.log(`Using ${tokenType} token, expires: ${expiresAt}`);
  return { token: data[0].token_value, expiresAt: data[0].expires_at };
}

// Main handler with top-level error catching
export default async function handler(req, res) {
  try {
    console.log('=== Consent API called ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Query:', req.query);
    console.log('Environment check - URL:', !!process.env.VITE_SUPABASE_URL);
    console.log('Environment check - Key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      res.status(204).end();
      return;
    }

    if (req.method !== 'GET') {
      console.log('Method not allowed:', req.method);
      res.status(405).json({ error: 'Method not allowed', method: req.method });
      return;
    }

    console.log('Processing GET request');
    const { msisdn } = req.query;
    console.log('MSISDN parameter:', msisdn);

    if (!msisdn) {
      console.log('Missing msisdn parameter');
      res.status(400).json({ error: 'Missing msisdn parameter' });
      return;
    }

    // Debug: Check database connectivity
    try {
      const { data: testData, error: testError } = await supabase
        .from('integration_tokens')
        .select('count')
        .limit(1);
      console.log('Database connectivity test:', { testData, testError });
    } catch (dbError) {
      console.error('Database connectivity error:', dbError);
    }

    let tok = await getToken('telenity', 'consent');
    if (!tok) {
      console.log('No valid consent token found, attempting to refresh tokens...');
      const refreshed = await refreshTokensIfNeeded();
      if (refreshed) {
        tok = await getToken('telenity', 'consent');
      }
      if (!tok) {
        console.error('Still no valid consent token after refresh attempt');
        res.status(500).json({ error: 'No consent token available or token expired' });
        return;
      }
    }

    console.log(`Making consent check request for msisdn: ${msisdn}`);
    console.log(`Token available: ${!!tok.token}`);

    const requestUrl = `https://india-agw.telenity.com/apigw/NOFBconsent/v1/NOFBconsent?address=tel:+${msisdn}`;
    console.log(`Request URL: ${requestUrl}`);

    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Authorization': `bearer ${tok.token}`
      },
    });

    console.log(`Telenity API response status: ${response.status}`);
    console.log(`Telenity API response headers:`, Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log(`Raw response (first 200 chars):`, responseText.substring(0, 200));
    console.log(`Response content type:`, response.headers.get('content-type'));

    let responseBody;
    try {
      responseBody = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', responseText);
      responseBody = { raw: responseText, parseError: parseError.message };
    }

    res.status(response.status).json(responseBody);
  } catch (error) {
    console.error('Consent proxy error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      type: 'consent_api_error'
    });
  } catch (topLevelError) {
    console.error('=== TOP LEVEL ERROR ===');
    console.error('Error:', topLevelError);
    console.error('Stack:', topLevelError.stack);

    // Last resort - make sure we return valid JSON
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({
        error: 'Critical server error',
        message: 'An unexpected error occurred',
        type: 'critical_error'
      });
    }
  }
}
