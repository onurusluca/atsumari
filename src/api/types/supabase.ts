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
        Relationships: [
          {
            foreignKeyName: "message_reactions_id_fkey"
            columns: ["id"]
            referencedRelation: "messages"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "messages_space_id_fkey"
            columns: ["space_id"]
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "spaces_room_snapshot_fkey"
            columns: ["room_snapshot"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spaces_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      visited_spaces: {
        Row: {
          created_at: string | null
          id: string
          name: string
          space_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          space_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          space_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visited_spaces_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
