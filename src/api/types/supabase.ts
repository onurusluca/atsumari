export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      message_reactions: {
        Row: {
          created_at: string | null
          id: string
          reactions: Json[] | null
        }
        Insert: {
          created_at?: string | null
          id: string
          reactions?: Json[] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          reactions?: Json[] | null
        }
      }
      messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          reactions: Json[] | null
          space_id: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          reactions?: Json[] | null
          space_id?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          reactions?: Json[] | null
          space_id?: string | null
          user_id?: string | null
          user_name?: string | null
        }
      }
      plans: {
        Row: {
          id: number
          plan_id: number
          plan_name: string
          price: string
        }
        Insert: {
          id?: number
          plan_id: number
          plan_name: string
          price: string
        }
        Update: {
          id?: number
          plan_id?: number
          plan_name?: string
          price?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          character_sprite: string | null
          character_styles: Json | null
          id: string
          updated_at: string | null
          user_name_for_each_space: Json | null
          visited_spaces: number[] | null
        }
        Insert: {
          avatar_url?: string | null
          character_sprite?: string | null
          character_styles?: Json | null
          id: string
          updated_at?: string | null
          user_name_for_each_space?: Json | null
          visited_spaces?: number[] | null
        }
        Update: {
          avatar_url?: string | null
          character_sprite?: string | null
          character_styles?: Json | null
          id?: string
          updated_at?: string | null
          user_name_for_each_space?: Json | null
          visited_spaces?: number[] | null
        }
      }
      spaces: {
        Row: {
          allowed_emails: string[] | null
          created_at: string | null
          id: string
          image: string | null
          name: string
          password: string | null
          plan_id: number | null
          room_snapshot: string | null
          size: number
          user_id: string
        }
        Insert: {
          allowed_emails?: string[] | null
          created_at?: string | null
          id?: string
          image?: string | null
          name: string
          password?: string | null
          plan_id?: number | null
          room_snapshot?: string | null
          size: number
          user_id: string
        }
        Update: {
          allowed_emails?: string[] | null
          created_at?: string | null
          id?: string
          image?: string | null
          name?: string
          password?: string | null
          plan_id?: number | null
          room_snapshot?: string | null
          size?: number
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
