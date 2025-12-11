import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  throw new Error('Missing Supabase env');
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

  // Check if token is expired
  const expiresAt = new Date(data[0].expires_at);
  const now = new Date();
  if (expiresAt <= now) {
    console.error(`Token expired: ${expiresAt} <= ${now}`);
    return null;
  }

  return { token: data[0].token_value, expiresAt: data[0].expires_at };
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { msisdn } = req.query;

    if (!msisdn) {
      res.status(400).json({ error: 'Missing msisdn parameter' });
      return;
    }

    const tok = await getToken('telenity', 'consent');
    if (!tok) {
      console.error('No valid consent token found');
      res.status(500).json({ error: 'No consent token available or token expired' });
      return;
    }

    console.log(`Making consent check request for msisdn: ${msisdn}`);
    console.log(`Using token (first 20 chars): ${tok.token.substring(0, 20)}...`);

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
    let responseBody;
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = { raw: responseText };
    }

    res.status(response.status).json(responseBody);
  } catch (error) {
    console.error('Consent proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}
