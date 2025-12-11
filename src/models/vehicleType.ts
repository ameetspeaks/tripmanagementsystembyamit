export interface VehicleType {
  id: string;
  typeName: string;
  lengthM: number;
  breadthM: number;
  heightM: number;
  weightLoadCapacityTons: number;
  volumeLoadCapacityCum: number;
  createdAt: string;
  updatedAt: string;
}

export const VEHICLE_TYPES_TABLE = 'vehicle_types';
