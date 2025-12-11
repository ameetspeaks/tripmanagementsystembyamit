import { supabase } from "@/lib/supabaseClient";
import { CUSTOMERS_TABLE, Customer } from "@/models/customer";
import { PartnerFormData } from "@/lib/schemas";

function toCustomer(row: any): Customer {
  return {
    id: row.id,
    displayName: row.display_name,
    companyName: row.company_name,
    email: row.email ?? null,
    gstNumber: row.gst_number ?? null,
    panNumber: row.pan_number ?? null,
    phoneNumber: row.phone_number,
    address: row.address,
    integrationCode: row.integration_code ?? null,
    secondaryEmail: row.secondary_email ?? null,
    secondaryPhoneNumber: row.secondary_phone_number ?? null,
    status: row.status,
    consigneeCode: row.consignee_code ?? null,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDbPayload(data: PartnerFormData) {
  return {
    display_name: data.displayName,
    company_name: data.companyName,
    email: data.email || null,
    gst_number: data.gstNumber || null,
    pan_number: data.panNumber || null,
    phone_number: data.phoneNumber,
    address: data.address,
    integration_code: data.integrationCode || null,
    secondary_email: data.secondaryEmail || null,
    secondary_phone_number: data.secondaryPhoneNumber || null,
    status: data.status,
  };
}

export async function listCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from(CUSTOMERS_TABLE)
    .select("id, display_name, company_name, email, gst_number, pan_number, phone_number, address, integration_code, secondary_email, secondary_phone_number, status, consignee_code, active, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(toCustomer);
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const { data, error } = await supabase
    .from(CUSTOMERS_TABLE)
    .select("id, display_name, company_name, email, gst_number, pan_number, phone_number, address, integration_code, secondary_email, secondary_phone_number, status, consignee_code, active, created_at, updated_at")
    .eq("id", id)
    .single();
  if (error) return null;
  return toCustomer(data);
}

export async function createCustomer(payload: PartnerFormData): Promise<string> {
  const { data, error } = await supabase
    .from(CUSTOMERS_TABLE)
    .insert(toDbPayload(payload))
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateCustomer(id: string, payload: PartnerFormData) {
  const { error } = await supabase
    .from(CUSTOMERS_TABLE)
    .update(toDbPayload(payload))
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from(CUSTOMERS_TABLE)
    .delete()
    .eq("id", id);
  if (error) throw error;
}
