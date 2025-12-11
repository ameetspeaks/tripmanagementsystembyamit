export type UserStatus = "Active" | "Inactive";

export interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  role: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export const USER_PROFILE_TABLE = "profiles";
