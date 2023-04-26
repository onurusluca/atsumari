// For more info: https://vitejs.dev/guide/env-and-mode.html#env-variables

const EnvVariables = {
  // Auth0
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,

  // LiveKit
  livekitApiKey: import.meta.env.VITE_LIVEKIT_API_KEY as string,
  livekitUrl: import.meta.env.VITE_LIVEKIT_URL as string,
};

export { EnvVariables };
