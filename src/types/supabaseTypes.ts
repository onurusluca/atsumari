import type { Database } from "@/api/types/supabase";

export type MessageReactionsType =
  Database["public"]["Tables"]["message_reactions"]["Row"];
export type MessagesType = Database["public"]["Tables"]["messages"]["Row"];
export type PlansType = Database["public"]["Tables"]["plans"]["Row"];
export type ProfilesType = Database["public"]["Tables"]["profiles"]["Row"];
export type SpacesType = Database["public"]["Tables"]["spaces"]["Row"];
export type VisitedSpacesType = Database["public"]["Tables"]["visited_spaces"]["Row"];
