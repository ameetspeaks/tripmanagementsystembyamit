import { supabase } from "@/lib/supabaseClient";
import { DRIVERS_TABLE, Driver } from "@/models/driver";
import { DriverFormData } from "@/lib/schemas";

function toDriver(row: any): Driver {
  return {
    id: row.id,
    name: row.name,
    mobileNumber: row.mobile_number,
    isDedicated: row.is_dedicated,
    locationCode: row.location_code ?? null,
    licenseNumber: row.license_number,
    licenseIssueDate: row.license_issue_date ?? null,
    licenseExpiryDate: row.license_expiry_date,
    aadhaarNumber: row.aadhaar_number ?? null,
    panNumber: row.pan_number ?? null,
    voterIdNumber: row.voter_id_number ?? null,
    passportNumber: row.passport_number ?? null,
    policeVerificationNumber: row.police_verification_number ?? null,
    policeVerificationIssueDate: row.police_verification_issue_date ?? null,
    policeVerificationExpiryDate: row.police_verification_expiry_date ?? null,
    consentStatus: row.consent_status,
    status: row.status,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDbPayload(data: DriverFormData) {
  return {
    name: data.name,
    mobile_number: data.mobileNumber,
    is_dedicated: data.isDedicated,
    location_code: data.locationCode || null,
    license_number: data.licenseNumber,
    license_issue_date: data.licenseIssueDate || null,
    license_expiry_date: data.licenseExpiryDate,
    aadhaar_number: data.aadhaarNumber || null,
    pan_number: data.panNumber || null,
    voter_id_number: data.voterIdNumber || null,
    passport_number: data.passportNumber || null,
    police_verification_number: data.policeVerificationNumber || null,
    police_verification_issue_date: data.policeVerificationIssueDate || null,
    police_verification_expiry_date: data.policeVerificationExpiryDate || null,
    status: data.status,
  };
}

export async function listDrivers(): Promise<Driver[]> {
  const { data, error } = await supabase
    .from(DRIVERS_TABLE)
    .select("id, name, mobile_number, is_dedicated, location_code, license_number, license_issue_date, license_expiry_date, aadhaar_number, pan_number, voter_id_number, passport_number, police_verification_number, police_verification_issue_date, police_verification_expiry_date, consent_status, status, active, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(toDriver);
}

export async function getDriver(id: string): Promise<Driver | null> {
  const { data, error } = await supabase
    .from(DRIVERS_TABLE)
    .select("id, name, mobile_number, is_dedicated, location_code, license_number, license_issue_date, license_expiry_date, aadhaar_number, pan_number, voter_id_number, passport_number, police_verification_number, police_verification_issue_date, police_verification_expiry_date, consent_status, status, active, created_at, updated_at")
    .eq("id", id)
    .single();
  if (error) return null;
  return toDriver(data);
}

export async function createDriver(payload: DriverFormData): Promise<string> {
  const { data, error } = await supabase
    .from(DRIVERS_TABLE)
    .insert(toDbPayload(payload))
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateDriver(id: string, payload: DriverFormData) {
  const { error } = await supabase
    .from(DRIVERS_TABLE)
    .update(toDbPayload(payload))
    .eq("id", id);
  if (error) throw error;
}

export async function deleteDriver(id: string) {
  const { error } = await supabase
    .from(DRIVERS_TABLE)
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function initiateConsent(id: string) {
  const { error } = await supabase
    .from(DRIVERS_TABLE)
    .update({ consent_status: "Pending" })
    .eq("id", id);
  if (error) throw error;
}

export async function updateDriverConsentStatus(id: string, status: string) {
  const { error } = await supabase
    .from(DRIVERS_TABLE)
    .update({ consent_status: status })
    .eq("id", id);
  if (error) throw error;
}
