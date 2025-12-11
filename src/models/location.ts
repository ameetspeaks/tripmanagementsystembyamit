export type LocationStatus = "Active" | "Inactive";

export interface Location {
  id: string;
  address: string;
  locationName: string;
  consigneeCode: string | null;
  consigneeName: string | null;
  simRadius: number;
  gpsRadius: number;
  latitude: number | null;
  longitude: number | null;
  locationType: string;
  cityName: string;
  pincode: string;
  stateName: string;
  district: string | null;
  zone: string | null;
  taluka: string | null;
  areaOffice: string | null;
  integrationId: string | null;
  status: LocationStatus;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const LOCATIONS_TABLE = "locations";
