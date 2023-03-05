export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
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
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image?: string | null
          name: string
          password?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image?: string | null
          name?: string
          password?: string | null
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
