import { supabase } from '@/lib/supabaseClient';

export async function getToken(provider: string, tokenType: string) {
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

export async function setToken(provider: string, tokenType: string, token: string, expiresAt: string) {
  await supabase.from('integration_tokens').update({ active: false }).eq('provider', provider).eq('token_type', tokenType);
  const { error } = await supabase.from('integration_tokens').insert({ provider, token_type: tokenType, token_value: token, expires_at: expiresAt, active: true });
  if (error) throw error;
}

export function isExpired(expiresAt: string, marginMinutes = 5) {
  const expires = new Date(expiresAt).getTime();
  const now = Date.now() + marginMinutes * 60 * 1000;
  return expires <= now;
}
