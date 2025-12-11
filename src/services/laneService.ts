import { supabase } from "@/lib/supabaseClient";
import { LANES_TABLE, LANES_ROUTES_TABLE, Lane } from "@/models/lane";
import { LaneFormData } from "@/lib/schemas";

function toLane(row: any): Lane {
  return {
    id: row.id,
    laneType: row.lane_type,
    modeOfTransport: row.mode_of_transport,
    originName: row.origin_name,
    destinationName: row.destination_name,
    laneName: row.lane_name,
    laneCode: row.lane_code,
    integrationId: row.integration_id ?? null,
    distanceKm: row.distance_km,
    mapJson: row.map_json ?? null,
    laneStatus: row.lane_status,
    lanePrice: row.lane_price ?? null,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDbPayload(data: LaneFormData, mapJson?: any) {
  return {
    lane_type: data.laneType,
    mode_of_transport: data.modeOfTransport,
    origin_name: data.originName,
    destination_name: data.destinationName,
    lane_name: data.laneName,
    lane_code: data.laneCode,
    integration_id: data.integrationId || null,
    distance_km: parseFloat(String(data.distance)),
    map_json: mapJson ?? (data.mapJson ? JSON.parse(data.mapJson) : null),
    lane_status: data.status,
    lane_price: data.lanePrice ? parseFloat(String(data.lanePrice)) : null,
  };
}

export async function listLanes(): Promise<Lane[]> {
  const { data, error } = await supabase
    .from(LANES_TABLE)
    .select("id, lane_type, mode_of_transport, origin_name, destination_name, lane_name, lane_code, integration_id, distance_km, map_json, lane_status, lane_price, active, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(toLane);
}

export async function getLane(id: string): Promise<Lane | null> {
  const { data, error } = await supabase
    .from(LANES_TABLE)
    .select("id, lane_type, mode_of_transport, origin_name, destination_name, lane_name, lane_code, integration_id, distance_km, map_json, lane_status, lane_price, active, created_at, updated_at")
    .eq("id", id)
    .single();
  if (error) return null;
  return toLane(data);
}

export async function createLane(payload: LaneFormData, mapJson?: any): Promise<string> {
  const { data, error } = await supabase
    .from(LANES_TABLE)
    .insert(toDbPayload(payload, mapJson))
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateLane(id: string, payload: LaneFormData, mapJson?: any) {
  const { error } = await supabase
    .from(LANES_TABLE)
    .update(toDbPayload(payload, mapJson))
    .eq("id", id);
  if (error) throw error;
}

export async function deleteLane(id: string) {
  const { error } = await supabase
    .from(LANES_TABLE)
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function addLaneRoute(laneId: string, routeMode: string, polyline?: string, raw?: any, distanceMeters?: number, durationSeconds?: number) {
  const { error } = await supabase
    .from(LANES_ROUTES_TABLE)
    .insert({ lane_id: laneId, route_mode: routeMode, polyline: polyline ?? null, raw_json: raw ?? null, distance_meters: distanceMeters ?? null, duration_seconds: durationSeconds ?? null });
  if (error) throw error;
}
