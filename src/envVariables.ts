// For more info: https://vitejs.dev/guide/env-and-mode.html#env-variables

const EnvVariables = {
  // Auth0
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,

  // General
  currentEnv: import.meta.env.VITE_CURRENT_ENV as string,
  baseUrl: import.meta.env.VITE_BASE_URL as string,
  // LiveKit
  livekitApiKey: import.meta.env.VITE_LIVEKIT_API_KEY as string,
  livekitUrl: import.meta.env.VITE_LIVEKIT_URL as string,

  // WebRTC
  hmsAppAccessKey: import.meta.env.VITE_HMS_APP_ACCESS_KEY as string,
  hmsAppSecret: import.meta.env.VITE_HMS_APP_SECRET as string,
  webRtcApiBaseUrl: import.meta.env.VITE_WEBRTC_API_BASE_URL as string,
};

export { EnvVariables };