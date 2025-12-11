import { supabase } from '@/lib/supabaseClient';
import { VEHICLE_TYPES_TABLE, VehicleType } from '@/models/vehicleType';

function toVehicleType(row: any): VehicleType {
  return {
    id: row.id,
    typeName: row.type_name,
    lengthM: row.length_m,
    breadthM: row.breadth_m,
    heightM: row.height_m,
    weightLoadCapacityTons: row.weight_load_capacity_tons,
    volumeLoadCapacityCum: row.volume_load_capacity_cum,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listVehicleTypes(): Promise<VehicleType[]> {
  const { data, error } = await supabase
    .from(VEHICLE_TYPES_TABLE)
    .select('id, type_name, length_m, breadth_m, height_m, weight_load_capacity_tons, volume_load_capacity_cum, created_at, updated_at')
    .order('type_name');
  if (error) throw error;
  return (data || []).map(toVehicleType);
}

export async function createVehicleType(payload: Partial<VehicleType>) {
  const { error } = await supabase
    .from(VEHICLE_TYPES_TABLE)
    .insert({
      type_name: payload.typeName,
      length_m: payload.lengthM,
      breadth_m: payload.breadthM,
      height_m: payload.heightM,
      weight_load_capacity_tons: payload.weightLoadCapacityTons,
      volume_load_capacity_cum: payload.volumeLoadCapacityCum,
    });
  if (error) throw error;
}

export async function deleteVehicleType(id: string) {
  const { error } = await supabase
    .from(VEHICLE_TYPES_TABLE)
    .delete()
    .eq('id', id);
  if (error) throw error;
}
