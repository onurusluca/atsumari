import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { EnvVariables } from "@/envVariables";

export const supabase: SupabaseClient = createClient(
  EnvVariables.supabaseUrl,
  EnvVariables.supabaseAnonKey
);
