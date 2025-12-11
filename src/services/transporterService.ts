import { supabase } from '@/lib/supabaseClient';
import { TRANSPORTERS_TABLE, Transporter } from '@/models/transporter';

function toTransporter(row: any): Transporter {
  return {
    id: row.id,
    transporterName: row.transporter_name,
    code: row.code,
    email: row.email ?? null,
    mobile: row.mobile ?? null,
    company: row.company ?? null,
    address: row.address ?? null,
    gstin: row.gstin ?? null,
    pan: row.pan ?? null,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listTransporters(): Promise<Transporter[]> {
  const { data, error } = await supabase
    .from(TRANSPORTERS_TABLE)
    .select('id, transporter_name, code, email, mobile, company, address, gstin, pan, is_active, created_at, updated_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(toTransporter);
}

export async function getTransporter(id: string): Promise<Transporter | null> {
  const { data, error } = await supabase
    .from(TRANSPORTERS_TABLE)
    .select('id, transporter_name, code, email, mobile, company, address, gstin, pan, is_active, created_at, updated_at')
    .eq('id', id)
    .single();
  if (error) return null;
  return toTransporter(data);
}

export async function createTransporter(payload: Partial<Transporter>): Promise<string> {
  const { data, error } = await supabase
    .from(TRANSPORTERS_TABLE)
    .insert({
      transporter_name: payload.transporterName,
      code: payload.code,
      email: payload.email ?? null,
      mobile: payload.mobile ?? null,
      company: payload.company ?? null,
      address: payload.address ?? null,
      gstin: payload.gstin ?? null,
      pan: payload.pan ?? null,
      is_active: payload.isActive ?? 'Y',
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateTransporter(id: string, payload: Partial<Transporter>) {
  const { error } = await supabase
    .from(TRANSPORTERS_TABLE)
    .update({
      transporter_name: payload.transporterName,
      code: payload.code,
      email: payload.email ?? null,
      mobile: payload.mobile ?? null,
      company: payload.company ?? null,
      address: payload.address ?? null,
      gstin: payload.gstin ?? null,
      pan: payload.pan ?? null,
      is_active: payload.isActive ?? 'Y',
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteTransporter(id: string) {
  const { error } = await supabase
    .from(TRANSPORTERS_TABLE)
    .delete()
    .eq('id', id);
  if (error) throw error;
}
