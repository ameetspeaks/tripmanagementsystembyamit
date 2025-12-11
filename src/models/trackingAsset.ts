export type TrackingAssetStatus = 'Active' | 'Inactive';

export interface TrackingAsset {
  id: string;
  displayName: string | null;
  assetType: 'SIM' | 'GPS' | 'DriverApp';
  url: string | null;
  token: string | null;
  responseJson: any | null;
  transporterId: string | null;
  assetId: string;
  status: TrackingAssetStatus;
  createdAt: string;
  updatedAt: string;
}

export const TRACKING_ASSETS_TABLE = 'tracking_assets';
