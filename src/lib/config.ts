export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
};

export function assertConfig() {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error("Missing Supabase configuration: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
  }
}
