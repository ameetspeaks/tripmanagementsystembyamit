import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testOAuth() {
  // Get the consent auth credentials
  const { data: settings } = await supabase
    .from('sim_tracking_settings')
    .select('consent_auth_token')
    .eq('is_active', true)
    .limit(1);

  if (!settings || !settings.length) {
    console.log('No consent auth credentials found');
    return;
  }

  const consentAuthToken = settings[0].consent_auth_token;
  console.log('Testing OAuth with consent auth token (first 20 chars):', consentAuthToken.substring(0, 20) + '...');

  const url = 'https://india-agw.telenity.com/oauth/token?grant_type=client_credentials';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${consentAuthToken}`
      },
      body: 'grant_type=client_credentials'
    });

    console.log('OAuth Status:', response.status);
    console.log('OAuth Headers:', Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log('OAuth Response:', text);

    if (response.ok) {
      try {
        const json = JSON.parse(text);
        console.log('Parsed OAuth response:', json);
      } catch (parseError) {
        console.log('OAuth response is not JSON');
      }
    }

  } catch (error) {
    console.error('OAuth fetch error:', error);
  }
}

testOAuth();
