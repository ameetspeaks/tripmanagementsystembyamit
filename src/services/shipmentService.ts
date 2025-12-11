import { supabase } from '@/lib/supabaseClient';
import { SHIPMENTS_TABLE, Shipment } from '@/models/shipment';
import { ShipmentFormData } from '@/lib/schemas';

function toShipment(row: any): Shipment {
  return {
    id: row.id,
    name: row.name,
    isBulk: row.is_bulk,
    code: row.code,
    description: row.description ?? null,
    skuCode: row.sku_code,
    packaging: row.packaging,
    units: row.units,
    height: row.height_cm ?? null,
    width: row.width_cm ?? null,
    length: row.length_cm ?? null,
    weight: row.weight,
    weightUoM: row.weight_uom,
    volume: row.volume,
    volumeUoM: row.volume_uom,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDbPayload(data: ShipmentFormData) {
  return {
    name: data.name,
    is_bulk: data.isBulk,
    code: data.code,
    description: data.description || null,
    sku_code: data.skuCode,
    packaging: data.packaging,
    units: data.units,
    height_cm: data.height ? parseFloat(data.height) : null,
    width_cm: data.width ? parseFloat(data.width) : null,
    length_cm: data.length ? parseFloat(data.length) : null,
    weight: parseFloat(data.weight),
    weight_uom: data.weightUoM,
    volume: parseFloat(data.volume),
    volume_uom: data.volumeUoM,
    status: data.status,
  };
}

export async function listShipments(): Promise<Shipment[]> {
  const { data, error } = await supabase
    .from(SHIPMENTS_TABLE)
    .select('id, name, is_bulk, code, description, sku_code, packaging, units, height_cm, width_cm, length_cm, weight, weight_uom, volume, volume_uom, status, created_at, updated_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(toShipment);
}

export async function getShipment(id: string): Promise<Shipment | null> {
  const { data, error } = await supabase
    .from(SHIPMENTS_TABLE)
    .select('id, name, is_bulk, code, description, sku_code, packaging, units, height_cm, width_cm, length_cm, weight, weight_uom, volume, volume_uom, status, created_at, updated_at')
    .eq('id', id)
    .single();
  if (error) return null;
  return toShipment(data);
}

export async function createShipment(payload: ShipmentFormData): Promise<string> {
  const { data, error } = await supabase
    .from(SHIPMENTS_TABLE)
    .insert(toDbPayload(payload))
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateShipment(id: string, payload: ShipmentFormData) {
  const { error } = await supabase
    .from(SHIPMENTS_TABLE)
    .update(toDbPayload(payload))
    .eq('id', id);
  if (error) throw error;
}

export async function deleteShipment(id: string) {
  const { error } = await supabase
    .from(SHIPMENTS_TABLE)
    .delete()
    .eq('id', id);
  if (error) throw error;
}
