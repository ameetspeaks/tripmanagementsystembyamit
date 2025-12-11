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
