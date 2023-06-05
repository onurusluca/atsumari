import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { EnvVariables } from "@/envVariables";

export const supabase: SupabaseClient = createClient(
  EnvVariables.supabaseUrl,
  EnvVariables.supabaseAnonKey,
  {
    realtime: {
      params: {
        // JavaScript client has a default rate limit of 1 Realtime event every 100 milliseconds that's configured by eventsPerSecond. Here we set it to 5 events per second.
        eventsPerSecond: 5,
      },
    },
  }
);
