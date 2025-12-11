export interface Transporter {
  id: string;
  transporterName: string;
  code: string;
  email: string | null;
  mobile: string | null;
  company: string | null;
  address: string | null;
  gstin: string | null;
  pan: string | null;
  isActive: 'Y' | 'N';
  createdAt: string;
  updatedAt: string;
}

export const TRANSPORTERS_TABLE = 'transporters';
