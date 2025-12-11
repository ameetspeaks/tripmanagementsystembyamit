import { createClient } from "@supabase/supabase-js";
import { config, assertConfig } from "./config";

assertConfig();

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
