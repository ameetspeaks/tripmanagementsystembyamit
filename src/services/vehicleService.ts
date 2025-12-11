import { supabase } from '@/lib/supabaseClient';
import { VEHICLES_TABLE, Vehicle } from '@/models/vehicle';
import { VehicleFormData } from '@/lib/schemas';

function toVehicle(row: any): Vehicle {
  return {
    id: row.id,
    vehicleNumber: row.vehicle_number,
    vehicleTypeId: row.vehicle_type_id ?? null,
    trackingAsset: row.tracking_asset ?? null,
    isDedicated: row.is_dedicated,
    locationCode: row.location_code ?? null,
    integrationCode: row.integration_code ?? null,
    transporterId: row.transporter_id ?? null,
    status: row.status,
    rcNumber: row.rc_number ?? null,
    rcIssueDate: row.rc_issue_date ?? null,
    rcExpiryDate: row.rc_expiry_date ?? null,
    pucNumber: row.puc_number ?? null,
    pucIssueDate: row.puc_issue_date ?? null,
    pucExpiryDate: row.puc_expiry_date ?? null,
    insuranceNumber: row.insurance_number ?? null,
    insuranceIssueDate: row.insurance_issue_date ?? null,
    insuranceExpiryDate: row.insurance_expiry_date ?? null,
    fitnessNumber: row.fitness_number ?? null,
    fitnessIssueDate: row.fitness_issue_date ?? null,
    fitnessExpiryDate: row.fitness_expiry_date ?? null,
    permitNumber: row.permit_number ?? null,
    permitIssueDate: row.permit_issue_date ?? null,
    permitExpiryDate: row.permit_expiry_date ?? null,
    hydraulicTestNumber: row.hydraulic_test_number ?? null,
    hydraulicTestIssueDate: row.hydraulic_test_issue_date ?? null,
    hydraulicTestExpiryDate: row.hydraulic_test_expiry_date ?? null,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDbPayload(data: VehicleFormData) {
  return {
    vehicle_number: data.vehicleNumber,
    vehicle_type_id: null,
    tracking_asset: data.trackingAsset || null,
    is_dedicated: data.isDedicated,
    location_code: data.locationCode || null,
    integration_code: data.integrationCode || null,
    status: data.status,
    rc_number: data.rcNumber || null,
    rc_issue_date: data.rcIssueDate || null,
    rc_expiry_date: data.rcExpiryDate || null,
    puc_number: data.pucNumber || null,
    puc_issue_date: data.pucIssueDate || null,
    puc_expiry_date: data.pucExpiryDate || null,
    insurance_number: data.insuranceNumber || null,
    insurance_issue_date: data.insuranceIssueDate || null,
    insurance_expiry_date: data.insuranceExpiryDate || null,
    fitness_number: data.fitnessNumber || null,
    fitness_issue_date: data.fitnessIssueDate || null,
    fitness_expiry_date: data.fitnessExpiryDate || null,
    permit_number: data.permitNumber || null,
    permit_issue_date: data.permitIssueDate || null,
    permit_expiry_date: data.permitExpiryDate || null,
    hydraulic_test_number: data.hydraulicTestNumber || null,
    hydraulic_test_issue_date: data.hydraulicTestIssueDate || null,
    hydraulic_test_expiry_date: data.hydraulicTestExpiryDate || null,
  };
}

export async function listVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from(VEHICLES_TABLE)
    .select('id, vehicle_number, vehicle_type_id, tracking_asset, is_dedicated, location_code, integration_code, transporter_id, status, rc_number, rc_issue_date, rc_expiry_date, puc_number, puc_issue_date, puc_expiry_date, insurance_number, insurance_issue_date, insurance_expiry_date, fitness_number, fitness_issue_date, fitness_expiry_date, permit_number, permit_issue_date, permit_expiry_date, hydraulic_test_number, hydraulic_test_issue_date, hydraulic_test_expiry_date, active, created_at, updated_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(toVehicle);
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  const { data, error } = await supabase
    .from(VEHICLES_TABLE)
    .select('id, vehicle_number, vehicle_type_id, tracking_asset, is_dedicated, location_code, integration_code, transporter_id, status, rc_number, rc_issue_date, rc_expiry_date, puc_number, puc_issue_date, puc_expiry_date, insurance_number, insurance_issue_date, insurance_expiry_date, fitness_number, fitness_issue_date, fitness_expiry_date, permit_number, permit_issue_date, permit_expiry_date, hydraulic_test_number, hydraulic_test_issue_date, hydraulic_test_expiry_date, active, created_at, updated_at')
    .eq('id', id)
    .single();
  if (error) return null;
  return toVehicle(data);
}

export async function createVehicle(payload: VehicleFormData): Promise<string> {
  const { data, error } = await supabase
    .from(VEHICLES_TABLE)
    .insert(toDbPayload(payload))
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateVehicle(id: string, payload: VehicleFormData) {
  const { error } = await supabase
    .from(VEHICLES_TABLE)
    .update(toDbPayload(payload))
    .eq('id', id);
  if (error) throw error;
}

export async function deleteVehicle(id: string) {
  const { error } = await supabase
    .from(VEHICLES_TABLE)
    .delete()
    .eq('id', id);
  if (error) throw error;
}
