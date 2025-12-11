import { supabase } from '@/lib/supabaseClient';
import { SERVICEABILITY_TABLE, ServiceabilityLane } from '@/models/serviceability';

function toLane(row: any): ServiceabilityLane {
  return {
    id: row.id,
    laneCode: row.lane_code,
    freightTypeCode: row.freight_type_code,
    serviceabilityMode: row.serviceability_mode,
    transporterCode: row.transporter_code ?? null,
    vehicleTypeCode: row.vehicle_type_code,
    standardTat: row.standard_tat,
    expressTat: row.express_tat ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listServiceability(): Promise<ServiceabilityLane[]> {
  const { data, error } = await supabase
    .from(SERVICEABILITY_TABLE)
    .select('id, lane_code, freight_type_code, serviceability_mode, transporter_code, vehicle_type_code, standard_tat, express_tat, created_at, updated_at')
    .order('lane_code');
  if (error) throw error;
  return (data || []).map(toLane);
}

export async function createServiceability(payload: Omit<ServiceabilityLane, 'id'|'createdAt'|'updatedAt'>) {
  const { error } = await supabase
    .from(SERVICEABILITY_TABLE)
    .insert({
      lane_code: payload.laneCode,
      freight_type_code: payload.freightTypeCode,
      serviceability_mode: payload.serviceabilityMode,
      transporter_code: payload.transporterCode ?? null,
      vehicle_type_code: payload.vehicleTypeCode,
      standard_tat: payload.standardTat,
      express_tat: payload.expressTat ?? null,
    });
  if (error) throw error;
}

export async function deleteServiceability(id: string) {
  const { error } = await supabase
    .from(SERVICEABILITY_TABLE)
    .delete()
    .eq('id', id);
  if (error) throw error;
}
