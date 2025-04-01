export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      airdrop_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      airdrop_rankings: {
        Row: {
          airdrop_id: string | null
          category: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          position: number
          user_id: string
        }
        Insert: {
          airdrop_id?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          position: number
          user_id: string
        }
        Update: {
          airdrop_id?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          position?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "airdrop_rankings_airdrop_id_fkey"
            columns: ["airdrop_id"]
            isOneToOne: false
            referencedRelation: "airdrops"
            referencedColumns: ["id"]
          },
        ]
      }
      airdrops: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_completed: boolean | null
          is_pinned: boolean | null
          logo_url: string | null
          name: string
          reward_potential: string | null
          time_required: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_completed?: boolean | null
          is_pinned?: boolean | null
          logo_url?: string | null
          name: string
          reward_potential?: string | null
          time_required?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_completed?: boolean | null
          is_pinned?: boolean | null
          logo_url?: string | null
          name?: string
          reward_potential?: string | null
          time_required?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          button_action: string | null
          button_text: string | null
          created_at: string | null
          id: string
          link: string | null
          status: string
          subtitle: string | null
          time_left: string | null
          title: string
          user_id: string
        }
        Insert: {
          button_action?: string | null
          button_text?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          status: string
          subtitle?: string | null
          time_left?: string | null
          title: string
          user_id: string
        }
        Update: {
          button_action?: string | null
          button_text?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          status?: string
          subtitle?: string | null
          time_left?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_admin: boolean | null
          is_video_creator: boolean | null
          level: number | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          is_admin?: boolean | null
          is_video_creator?: boolean | null
          level?: number | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_admin?: boolean | null
          is_video_creator?: boolean | null
          level?: number | null
          username?: string
        }
        Relationships: []
      }
      tool_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_completed: boolean | null
          is_pinned: boolean | null
          logo_url: string | null
          name: string
          url: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_completed?: boolean | null
          is_pinned?: boolean | null
          logo_url?: string | null
          name: string
          url?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_completed?: boolean | null
          is_pinned?: boolean | null
          logo_url?: string | null
          name?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
