export interface ServiceabilityLane {
  id: string;
  laneCode: string;
  freightTypeCode: string;
  serviceabilityMode: string;
  transporterCode: string | null;
  vehicleTypeCode: string;
  standardTat: number;
  expressTat: number | null;
  createdAt: string;
  updatedAt: string;
}

export const SERVICEABILITY_TABLE = 'serviceability_lanes';
