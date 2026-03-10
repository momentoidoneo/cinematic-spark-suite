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
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
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
          grid_col: number | null
          grid_row: number | null
          icon: string | null
          id: string
          is_visible: boolean
          name: string
          order: number
          slug: string
          updated_at: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          grid_col?: number | null
          grid_row?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean
          name: string
          order?: number
          slug: string
          updated_at?: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          grid_col?: number | null
          grid_row?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean
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
          grid_col: number | null
          grid_row: number | null
          id: string
          image_url: string
          is_featured: boolean
          media_type: string
          order: number
          subcategory_id: string
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          description?: string | null
          grid_col?: number | null
          grid_row?: number | null
          id?: string
          image_url: string
          is_featured?: boolean
          media_type?: string
          order?: number
          subcategory_id: string
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          description?: string | null
          grid_col?: number | null
          grid_row?: number | null
          id?: string
          image_url?: string
          is_featured?: boolean
          media_type?: string
          order?: number
          subcategory_id?: string
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          video_url?: string | null
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
          cover_position: string
          created_at: string
          description: string | null
          gallery_style: string | null
          grid_col: number | null
          grid_row: number | null
          icon: string | null
          id: string
          is_visible: boolean
          link_enabled: boolean
          name: string
          order: number
          slug: string
          updated_at: string
        }
        Insert: {
          category_id: string
          cover_image?: string | null
          cover_position?: string
          created_at?: string
          description?: string | null
          gallery_style?: string | null
          grid_col?: number | null
          grid_row?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean
          link_enabled?: boolean
          name: string
          order?: number
          slug: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          cover_image?: string | null
          cover_position?: string
          created_at?: string
          description?: string | null
          gallery_style?: string | null
          grid_col?: number | null
          grid_row?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean
          link_enabled?: boolean
          name?: string
          order?: number
          slug?: string
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
      pricing_plans: {
        Row: {
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          is_highlighted: boolean
          is_visible: boolean
          name: string
          order: number
          price: number | null
          price_suffix: string | null
          show_from: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          is_highlighted?: boolean
          is_visible?: boolean
          name: string
          order?: number
          price?: number | null
          price_suffix?: string | null
          show_from?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          is_highlighted?: boolean
          is_visible?: boolean
          name?: string
          order?: number
          price?: number | null
          price_suffix?: string | null
          show_from?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      pricing_services: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_visible: boolean
          name: string
          order: number
          price: number | null
          price_suffix: string | null
          show_from: boolean
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_visible?: boolean
          name: string
          order?: number
          price?: number | null
          price_suffix?: string | null
          show_from?: boolean
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_visible?: boolean
          name?: string
          order?: number
          price?: number | null
          price_suffix?: string | null
          show_from?: boolean
          updated_at?: string
        }
        Relationships: []
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
      saved_prospects: {
        Row: {
          analysis: Json | null
          brand_context: string | null
          created_at: string
          created_by: string | null
          generated_dms: string | null
          id: string
          message_style: string | null
          profile_content: string | null
          profile_description: string | null
          profile_title: string | null
          profile_url: string | null
          username: string
        }
        Insert: {
          analysis?: Json | null
          brand_context?: string | null
          created_at?: string
          created_by?: string | null
          generated_dms?: string | null
          id?: string
          message_style?: string | null
          profile_content?: string | null
          profile_description?: string | null
          profile_title?: string | null
          profile_url?: string | null
          username: string
        }
        Update: {
          analysis?: Json | null
          brand_context?: string | null
          created_at?: string
          created_by?: string | null
          generated_dms?: string | null
          id?: string
          message_style?: string | null
          profile_content?: string | null
          profile_description?: string | null
          profile_title?: string | null
          profile_url?: string | null
          username?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          label: string | null
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          label?: string | null
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          label?: string | null
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      social_analytics: {
        Row: {
          comments: number | null
          created_at: string
          engagement_rate: number | null
          followers: number | null
          id: string
          impressions: number | null
          likes: number | null
          metric_date: string
          platform: string
          profile_views: number | null
          reach: number | null
          shares: number | null
          website_clicks: number | null
        }
        Insert: {
          comments?: number | null
          created_at?: string
          engagement_rate?: number | null
          followers?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          metric_date: string
          platform: string
          profile_views?: number | null
          reach?: number | null
          shares?: number | null
          website_clicks?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string
          engagement_rate?: number | null
          followers?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          metric_date?: string
          platform?: string
          profile_views?: number | null
          reach?: number | null
          shares?: number | null
          website_clicks?: number | null
        }
        Relationships: []
      }
      social_content: {
        Row: {
          ai_generated: boolean | null
          campaign: string | null
          caption: string | null
          content_type: string
          created_at: string
          hashtags: string[] | null
          id: string
          image_url: string | null
          platform: string
          scheduled_at: string | null
          status: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          campaign?: string | null
          caption?: string | null
          content_type?: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          platform?: string
          scheduled_at?: string | null
          status?: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          campaign?: string | null
          caption?: string | null
          content_type?: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          platform?: string
          scheduled_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      social_content_bank: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          name: string
          tags: string[] | null
          times_used: number | null
          type: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          tags?: string[] | null
          times_used?: number | null
          type?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          tags?: string[] | null
          times_used?: number | null
          type?: string
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
      social_platform_connections: {
        Row: {
          access_token: string | null
          account_id: string | null
          account_name: string | null
          connection_status: string
          created_at: string
          id: string
          is_active: boolean
          last_verified_at: string | null
          meta_data: Json | null
          platform: string
          refresh_token: string | null
          scopes: string[] | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          account_id?: string | null
          account_name?: string | null
          connection_status?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_verified_at?: string | null
          meta_data?: Json | null
          platform: string
          refresh_token?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          account_id?: string | null
          account_name?: string | null
          connection_status?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_verified_at?: string | null
          meta_data?: Json | null
          platform?: string
          refresh_token?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      social_publish_logs: {
        Row: {
          action: string
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          platform: string
          queue_id: string | null
          request_payload: Json | null
          response_payload: Json | null
          status: string
        }
        Insert: {
          action: string
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          platform: string
          queue_id?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          status: string
        }
        Update: {
          action?: string
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          platform?: string
          queue_id?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_publish_logs_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "social_publish_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      social_publish_queue: {
        Row: {
          attempt_count: number
          caption: string | null
          content_id: string | null
          created_at: string
          hashtags: string[] | null
          id: string
          last_error: string | null
          max_attempts: number
          media_type: string | null
          media_url: string | null
          next_retry_at: string | null
          platform: string
          platform_post_id: string | null
          platform_post_url: string | null
          platform_response: Json | null
          publish_mode: string
          published_at: string | null
          scheduled_at: string | null
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          caption?: string | null
          content_id?: string | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          last_error?: string | null
          max_attempts?: number
          media_type?: string | null
          media_url?: string | null
          next_retry_at?: string | null
          platform: string
          platform_post_id?: string | null
          platform_post_url?: string | null
          platform_response?: Json | null
          publish_mode?: string
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          caption?: string | null
          content_id?: string | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          last_error?: string | null
          max_attempts?: number
          media_type?: string | null
          media_url?: string | null
          next_retry_at?: string | null
          platform?: string
          platform_post_id?: string | null
          platform_post_url?: string | null
          platform_response?: Json | null
          publish_mode?: string
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_publish_queue_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "social_content"
            referencedColumns: ["id"]
          },
        ]
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
