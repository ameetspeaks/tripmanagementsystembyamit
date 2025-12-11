import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testConsentAPI() {
  // Use the latest token from OAuth response
  const token = 'edec201237118cbaa23fcfc5abbed7f5';
  console.log('Testing API call with latest OAuth token:', token);

  const msisdn = '919670006261';
  const url = `https://india-agw.telenity.com/apigw/NOFBconsent/v1/NOFBconsent?address=tel:+${msisdn}`;

  console.log('URL:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Authorization': `bearer ${token}`
      },
    });

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log('Response (first 500 chars):', text.substring(0, 500));

    // Try to parse as JSON
    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', json);
    } catch (parseError) {
      console.log('Not valid JSON, raw response shown above');
    }

  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testConsentAPI();
