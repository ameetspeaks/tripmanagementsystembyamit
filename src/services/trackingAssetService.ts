import { supabase } from '@/lib/supabaseClient';
import { TRACKING_ASSETS_TABLE, TrackingAsset } from '@/models/trackingAsset';
import { TrackingAssetFormData } from "@/lib/schemas";

function toAsset(row: any): TrackingAsset {
  return {
    id: row.id,
    displayName: row.display_name ?? null,
    assetType: row.asset_type,
    url: row.url ?? null,
    token: row.token ?? null,
    responseJson: row.response_json ?? null,
    transporterId: row.transporter_id ?? null,
    assetId: row.asset_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDbPayload(data: TrackingAssetFormData) {
  return {
    display_name: data.manufacturer || null,
    asset_type: data.assetType,
    url: null,
    token: null,
    response_json: null,
    transporter_id: null,
    asset_id: data.assetId,
    vehicle_id: data.vehicleId || null,
    driver_id: data.driverId || null,
    status: data.status,
  } as any;
}

export async function listTrackingAssets(): Promise<TrackingAsset[]> {
  const { data, error } = await supabase
    .from(TRACKING_ASSETS_TABLE)
    .select('id, display_name, asset_type, url, token, response_json, transporter_id, asset_id, status, created_at, updated_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(toAsset);
}

export async function getTrackingAsset(id: string): Promise<TrackingAsset | null> {
  const { data, error } = await supabase
    .from(TRACKING_ASSETS_TABLE)
    .select('id, display_name, asset_type, url, token, response_json, transporter_id, asset_id, status, created_at, updated_at')
    .eq('id', id)
    .single();
  if (error) return null;
  return toAsset(data);
}

export async function createTrackingAsset(payload: TrackingAssetFormData) {
  const { error } = await supabase
    .from(TRACKING_ASSETS_TABLE)
    .insert(toDbPayload(payload));
  if (error) throw error;
}

export async function updateTrackingAsset(id: string, payload: TrackingAssetFormData) {
  const { error } = await supabase
    .from(TRACKING_ASSETS_TABLE)
    .update(toDbPayload(payload))
    .eq('id', id);
  if (error) throw error;
}

export async function deleteTrackingAsset(id: string) {
  const { error } = await supabase
    .from(TRACKING_ASSETS_TABLE)
    .delete()
    .eq('id', id);
  if (error) throw error;
}
