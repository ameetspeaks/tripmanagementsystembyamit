export type LaneStatus = "Active" | "Inactive";

export interface Lane {
  id: string;
  laneType: string;
  modeOfTransport: string;
  originName: string;
  destinationName: string;
  laneName: string;
  laneCode: string;
  integrationId: string | null;
  distanceKm: number;
  mapJson: any | null;
  laneStatus: LaneStatus;
  lanePrice: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const LANES_TABLE = "lanes";
export const LANES_ROUTES_TABLE = "lanes_routes";
