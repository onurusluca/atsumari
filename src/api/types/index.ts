import type { Database } from './supabaseTypes'

// export profiles and spaces:

export type ProfilesType = Database['public']['Tables']['profiles']['Row']
export type SpacesType = Database['public']['Tables']['spaces']['Row']
