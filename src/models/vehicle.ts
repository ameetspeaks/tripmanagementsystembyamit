export type VehicleStatus = 'Active' | 'Inactive' | 'Pending';

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleTypeId: string | null;
  trackingAsset: string | null;
  isDedicated: 'Y' | 'N';
  locationCode: string | null;
  integrationCode: string | null;
  transporterId: string | null;
  status: VehicleStatus;
  rcNumber: string | null;
  rcIssueDate: string | null;
  rcExpiryDate: string | null;
  pucNumber: string | null;
  pucIssueDate: string | null;
  pucExpiryDate: string | null;
  insuranceNumber: string | null;
  insuranceIssueDate: string | null;
  insuranceExpiryDate: string | null;
  fitnessNumber: string | null;
  fitnessIssueDate: string | null;
  fitnessExpiryDate: string | null;
  permitNumber: string | null;
  permitIssueDate: string | null;
  permitExpiryDate: string | null;
  hydraulicTestNumber: string | null;
  hydraulicTestIssueDate: string | null;
  hydraulicTestExpiryDate: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const VEHICLES_TABLE = 'vehicles';
