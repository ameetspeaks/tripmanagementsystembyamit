import { supabase } from '@/lib/supabaseClient';

export async function upsertConsentForDriver(driverId: string, msisdn: string, status: string, opts?: { expiresAt?: string; entityId?: number; tracked?: boolean; importRequested?: boolean }) {
  const { data } = await supabase
    .from('consents')
    .select('id')
    .eq('driver_id', driverId)
    .limit(1);
  if (data && data.length) {
    const { error } = await supabase
      .from('consents')
      .update({ status, msisdn, expires_at: opts?.expiresAt ?? null, telenity_entity_id: opts?.entityId ?? null, tracked: opts?.tracked ?? null, import_requested: opts?.importRequested ?? false, consent_checked_at: new Date().toISOString() })
      .eq('id', data[0].id);
    if (error) throw error;
    return data[0].id;
  } else {
    const { data: inserted, error } = await supabase
      .from('consents')
      .insert({ driver_id: driverId, status, msisdn, expires_at: opts?.expiresAt ?? null, telenity_entity_id: opts?.entityId ?? null, tracked: opts?.tracked ?? null, import_requested: opts?.importRequested ?? false, consent_checked_at: new Date().toISOString() })
      .select('id')
      .single();
    if (error) throw error;
    return inserted.id as string;
  }
}

export async function checkConsentForDriver(driverId: string, msisdn: string) {
  try {
    // Get the consent token from database
    const { data: tokenData, error: tokenError } = await supabase
      .from('integration_tokens')
      .select('token_value')
      .eq('provider', 'telenity')
      .eq('token_type', 'consent')
      .eq('active', true)
      .limit(1);

    if (tokenError || !tokenData || !tokenData.length) {
      throw new Error('No consent token available');
    }

    const token = tokenData[0].token_value;

    // Call the Telenity consent API directly
    const res = await fetch(`https://india-agw.telenity.com/apigw/NOFBconsent/v1/NOFBconsent?address=tel:+${msisdn}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Authorization': `bearer ${token}`
      },
    });

    if (!res.ok) {
      throw new Error(`Consent check failed: ${res.status}`);
    }

    const data = await res.json();

    // Extract the consent status from the response
    const status = data?.Consent?.status || 'UNKNOWN';

    // Update the database with the fresh status
    await upsertConsentForDriver(driverId, msisdn, status);

    return status;
  } catch (error) {
    console.error('Consent check error:', error);
    // Don't update the database on error, just return the current status
    const { data } = await supabase
      .from('consents')
      .select('status')
      .eq('driver_id', driverId)
      .limit(1);
    return data?.[0]?.status || 'UNKNOWN';
  }
}
