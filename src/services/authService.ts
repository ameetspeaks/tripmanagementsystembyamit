import { supabase } from "@/lib/supabaseClient";
import { upsertCurrentUserProfile } from "@/services/userService";

export async function signUpEmailPassword(email: string, password: string, fullName?: string, phone?: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (data.user) {
    await upsertCurrentUserProfile({ email, fullName: fullName ?? null, phone: phone ?? null, role: "User", status: "Active" });
  }
  return data;
}

export async function signInEmailPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const { user } = data;
  if (user) {
    try {
      await upsertCurrentUserProfile({ email });
    } catch {}
  }
  return data;
}
