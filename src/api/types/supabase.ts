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
      messages: {
        Row: {
          created_at: string | null
          id: number
          message: string
          space_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          message: string
          space_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          message?: string
          space_id?: string
          user_id?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          character_styles: Json | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          character_styles?: Json | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          character_styles?: Json | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
      }
      spaces: {
        Row: {
          created_at: string | null
          id: string
          image: string | null
          name: string
          password: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image?: string | null
          name: string
          password?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image?: string | null
          name?: string
          password?: string | null
          type?: string | null
          user_id?: string
        }
      }
      user_current_info: {
        Row: {
          created_at: string | null
          id: string
          location_x: number
          location_y: number
          space_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id: string
          location_x: number
          location_y: number
          space_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location_x?: number
          location_y?: number
          space_id?: string
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
