export type DriverStatus = "Active" | "Inactive" | "Pending";
export type ConsentStatus = "Pending" | "Approved" | "Revoked";

export interface Driver {
  id: string;
  name: string;
  mobileNumber: string;
  isDedicated: "Y" | "N";
  locationCode: string | null;
  licenseNumber: string;
  licenseIssueDate: string | null;
  licenseExpiryDate: string;
  aadhaarNumber: string | null;
  panNumber: string | null;
  voterIdNumber: string | null;
  passportNumber: string | null;
  policeVerificationNumber: string | null;
  policeVerificationIssueDate: string | null;
  policeVerificationExpiryDate: string | null;
  consentStatus: ConsentStatus;
  status: DriverStatus;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DRIVERS_TABLE = "drivers";
