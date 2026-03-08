export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      legal_texts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          ip_hash: string | null
          page_path: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_hash?: string | null
          page_path: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_hash?: string | null
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      portfolio_categories: {
        Row: {
          cover_image: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          order: number
          slug: string
          updated_at: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          order?: number
          slug: string
          updated_at?: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          order?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_images: {
        Row: {
          alt_text: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_featured: boolean
          order: number
          subcategory_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_featured?: boolean
          order?: number
          subcategory_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_featured?: boolean
          order?: number
          subcategory_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_images_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "portfolio_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_subcategories: {
        Row: {
          category_id: string
          cover_image: string | null
          created_at: string
          description: string | null
          gallery_style: string | null
          icon: string | null
          id: string
          name: string
          order: number
          updated_at: string
        }
        Insert: {
          category_id: string
          cover_image?: string | null
          created_at?: string
          description?: string | null
          gallery_style?: string | null
          icon?: string | null
          id?: string
          name: string
          order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          cover_image?: string | null
          created_at?: string
          description?: string | null
          gallery_style?: string | null
          icon?: string | null
          id?: string
          name?: string
          order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "portfolio_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          code: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number | null
          ends_at: string | null
          id: string
          is_active: boolean
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          label: string | null
          order: number
          platform: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          order?: number
          platform: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          order?: number
          platform?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_config: {
        Row: {
          api_key_name: string | null
          auto_reply_enabled: boolean
          business_hours_end: string | null
          business_hours_start: string | null
          created_at: string
          id: string
          phone_number: string | null
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          api_key_name?: string | null
          auto_reply_enabled?: boolean
          business_hours_end?: string | null
          business_hours_start?: string | null
          created_at?: string
          id?: string
          phone_number?: string | null
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          api_key_name?: string | null
          auto_reply_enabled?: boolean
          business_hours_end?: string | null
          business_hours_start?: string | null
          created_at?: string
          id?: string
          phone_number?: string | null
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
