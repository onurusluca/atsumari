// For more info: https://vitejs.dev/guide/env-and-mode.html#env-variables

const EnvVariables = {
  // Auth0
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,

  // General
  currentEnv: import.meta.env.VITE_CURRENT_ENV as string,
  baseUrl: import.meta.env.VITE_BASE_URL as string,

  // WebRTC
  webRtcApiBaseUrl: import.meta.env.VITE_WEBRTC_API_BASE_URL as string,
  livekitHostUrl: import.meta.env.VITE_LIVEKIT_HOST_URL as string,

  // Realtime
  realtimeApiUrl: import.meta.env.VITE_REALTIME_API_URL as string,
};

export default EnvVariables;
