export type CustomerStatus = "Active" | "Inactive" | "Pending";

export interface Customer {
  id: string;
  displayName: string;
  companyName: string;
  email: string | null;
  gstNumber: string | null;
  panNumber: string | null;
  phoneNumber: string;
  address: string;
  integrationCode: string | null;
  secondaryEmail: string | null;
  secondaryPhoneNumber: string | null;
  status: CustomerStatus;
  consigneeCode: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CUSTOMERS_TABLE = "customers";
