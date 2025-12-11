export type ShipmentStatus = 'Active' | 'Inactive';

export interface Shipment {
  id: string;
  name: string;
  isBulk: 'Y' | 'N';
  code: string;
  description: string | null;
  skuCode: string;
  packaging: string;
  units: string;
  height: number | null;
  width: number | null;
  length: number | null;
  weight: number;
  weightUoM: string;
  volume: number;
  volumeUoM: string;
  status: ShipmentStatus;
  createdAt: string;
  updatedAt: string;
}

export const SHIPMENTS_TABLE = 'shipments';
