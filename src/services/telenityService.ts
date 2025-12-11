export async function getAuthToken(authorizationToken: string) {
  const res = await fetch('https://smarttrail.telenity.com/trail-rest/login', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authorizationToken}`,
    },
  });
  if (!res.ok) throw new Error('Telenity auth failed');
  const json = await res.json();
  return { token: json.token as string, expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() };
}

export async function getConsentAccessToken(consentAuthToken: string) {
  const res = await fetch('https://india-agw.telenity.com/oauth/token?grant_type=client_credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${consentAuthToken}`,
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error('Consent auth failed');
  const json = await res.json();
  const expiresIn = (json.expires_in as number) ?? 3600;
  return { accessToken: json.access_token as string, expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString() };
}

export async function importEntity(msisdn: string, firstName: string, lastName: string, authToken: string) {
  const res = await fetch('https://smarttrail.telenity.com/trail-rest/entities/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${authToken}`,
    },
    body: JSON.stringify({ entityImportList: [{ firstName, lastName, msisdn }] }),
  });
  if (!res.ok) throw new Error('Import API failed');
  const json = await res.json();
  return json;
}

export async function getLocation(msisdn: string, authToken: string) {
  const res = await fetch(`https://smarttrail.telenity.com/trail-rest/location/msisdnList/${msisdn}?lastResult=true`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${authToken}`,
    },
  });
  if (!res.ok) throw new Error('Location API failed');
  const json = await res.json();
  return json;
}

export async function importEntities(authToken: string, entities: Array<{ firstName: string; lastName: string; msisdn: string }>) {
  const res = await fetch('https://smarttrail.telenity.com/trail-rest/entities/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${authToken}`,
    },
    body: JSON.stringify({ entityImportList: entities }),
  });
  if (!res.ok) throw new Error('Import API failed');
  const json = await res.json();
  return json;
}

export async function checkConsent(msisdn: string, accessToken: string) {
  const res = await fetch(`https://india-agw.telenity.com/apigw/NOFBconsent/v1/NOFBconsent?address=tel:+${msisdn}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error('Consent API failed');
  const json = await res.json();
  return json;
}
