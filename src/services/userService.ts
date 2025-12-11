import { supabase } from "@/lib/supabaseClient";
import { USER_PROFILE_TABLE, UserProfile } from "@/models/user";

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) return null;

  const { data, error } = await supabase
    .from(USER_PROFILE_TABLE)
    .select("id, email, phone, full_name, role, status, created_at, updated_at")
    .eq("id", user.id)
    .single();
  if (error) throw error;

  return {
    id: data.id,
    email: data.email,
    phone: data.phone,
    fullName: data.full_name,
    role: data.role,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function upsertCurrentUserProfile(payload: Partial<Omit<UserProfile, "id" | "createdAt" | "updatedAt">>) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("No authenticated user");

  const { error } = await supabase
    .from(USER_PROFILE_TABLE)
    .upsert({
      id: user.id,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      full_name: payload.fullName ?? null,
      role: payload.role ?? "User",
      status: payload.status ?? "Active",
    });
  if (error) throw error;
}
