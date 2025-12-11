import { supabase } from "@/lib/supabaseClient";
import { LOCATIONS_TABLE, Location } from "@/models/location";
import { LocationFormData } from "@/lib/schemas";

function toLocation(row: any): Location {
  return {
    id: row.id,
    address: row.address,
    locationName: row.location_name,
    consigneeCode: row.consignee_code ?? null,
    consigneeName: row.consignee_name ?? null,
    simRadius: row.sim_radius,
    gpsRadius: row.gps_radius,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    locationType: row.location_type,
    cityName: row.city_name,
    pincode: row.pincode,
    stateName: row.state_name,
    district: row.district ?? null,
    zone: row.zone ?? null,
    taluka: row.taluka ?? null,
    areaOffice: row.area_office ?? null,
    integrationId: row.integration_id ?? null,
    status: row.status,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDbPayload(data: LocationFormData) {
  return {
    address: data.address,
    location_name: data.locationName,
    consignee_code: data.consigneeCode || null,
    consignee_name: data.consigneeName || null,
    sim_radius: parseInt(data.simRadius, 10),
    gps_radius: parseInt(data.gpsRadius, 10),
    latitude: data.latitude ? parseFloat(data.latitude) : null,
    longitude: data.longitude ? parseFloat(data.longitude) : null,
    location_type: data.locationType,
    city_name: data.cityName,
    pincode: data.pincode,
    state_name: data.stateName,
    district: data.district || null,
    zone: data.zone || null,
    taluka: data.taluka || null,
    area_office: data.areaOffice || null,
    integration_id: data.integrationId || null,
    status: data.status,
  };
}

export async function listLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from(LOCATIONS_TABLE)
    .select("id, address, location_name, consignee_code, consignee_name, sim_radius, gps_radius, latitude, longitude, location_type, city_name, pincode, state_name, district, zone, taluka, area_office, integration_id, status, active, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(toLocation);
}

export async function getLocation(id: string): Promise<Location | null> {
  const { data, error } = await supabase
    .from(LOCATIONS_TABLE)
    .select("id, address, location_name, consignee_code, consignee_name, sim_radius, gps_radius, latitude, longitude, location_type, city_name, pincode, state_name, district, zone, taluka, area_office, integration_id, status, active, created_at, updated_at")
    .eq("id", id)
    .single();
  if (error) return null;
  return toLocation(data);
}

export async function createLocation(payload: LocationFormData): Promise<string> {
  const { data, error } = await supabase
    .from(LOCATIONS_TABLE)
    .insert(toDbPayload(payload))
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateLocation(id: string, payload: LocationFormData) {
  const { error } = await supabase
    .from(LOCATIONS_TABLE)
    .update(toDbPayload(payload))
    .eq("id", id);
  if (error) throw error;
}

export async function deleteLocation(id: string) {
  const { error } = await supabase
    .from(LOCATIONS_TABLE)
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function upsertLocationFromPlace(place: { locationName: string; address: string; latitude?: number; longitude?: number; cityName?: string; pincode?: string; stateName?: string }) {
  const { data: existing } = await supabase
    .from(LOCATIONS_TABLE)
    .select("id")
    .eq("location_name", place.locationName)
    .maybeSingle();
  const payload: LocationFormData = {
    address: place.address,
    locationName: place.locationName,
    consigneeCode: "",
    consigneeName: "",
    simRadius: "5000",
    gpsRadius: "500",
    latitude: place.latitude != null ? String(place.latitude) : "",
    longitude: place.longitude != null ? String(place.longitude) : "",
    locationType: "Node",
    cityName: place.cityName || "",
    pincode: place.pincode || "",
    stateName: place.stateName || "",
    district: "",
    zone: "",
    taluka: "",
    areaOffice: "",
    integrationId: "",
    status: "Active",
  };
  if (existing?.id) {
    await updateLocation(existing.id, payload);
    return existing.id;
  }
  return await createLocation(payload);
}
