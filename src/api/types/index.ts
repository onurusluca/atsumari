import type { Database } from "./supabase";

// export profiles and spaces:
export type ProfilesType = Database["public"]["Tables"]["profiles"]["Row"];
export type SpacesType = Database["public"]["Tables"]["spaces"]["Row"];
export type SpaceType = Database["public"]["Tables"]["spaces"]["Row"];
export type MessagesType = Database["public"]["Tables"]["messages"]["Row"];
