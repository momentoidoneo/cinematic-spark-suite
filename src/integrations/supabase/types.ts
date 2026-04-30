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
      ab_test_events: {
        Row: {
          created_at: string
          device_type: string | null
          event_type: string
          id: string
          session_id: string | null
          test_id: string
          utm_source: string | null
          variant_id: string
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          event_type: string
          id?: string
          session_id?: string | null
          test_id: string
          utm_source?: string | null
          variant_id: string
        }
        Update: {
          created_at?: string
          device_type?: string | null
          event_type?: string
          id?: string
          session_id?: string | null
          test_id?: string
          utm_source?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_events_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_events_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "ab_test_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_variants: {
        Row: {
          button_color: string | null
          button_text: string
          created_at: string
          id: string
          is_control: boolean
          label: string
          test_id: string
          weight: number
        }
        Insert: {
          button_color?: string | null
          button_text: string
          created_at?: string
          id?: string
          is_control?: boolean
          label: string
          test_id: string
          weight?: number
        }
        Update: {
          button_color?: string | null
          button_text?: string
          created_at?: string
          id?: string
          is_control?: boolean
          label?: string
          test_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_variants_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          created_at: string
          description: string | null
          ended_at: string | null
          id: string
          location: string
          name: string
          started_at: string | null
          status: string
          target_device: string
          target_source: string | null
          updated_at: string
          winner_variant_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          location?: string
          name: string
          started_at?: string | null
          status?: string
          target_device?: string
          target_source?: string | null
          updated_at?: string
          winner_variant_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          location?: string
          name?: string
          started_at?: string | null
          status?: string
          target_device?: string
          target_source?: string | null
          updated_at?: string
          winner_variant_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          scheduled_at: string | null
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
          scheduled_at?: string | null
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
          scheduled_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_templates: {
        Row: {
          content: string
          created_at: string
          description: string | null
          excerpt: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          description?: string | null
          excerpt?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          description?: string | null
          excerpt?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      commercial_clients: {
        Row: {
          address: string | null
          city: string | null
          company: string | null
          country: string | null
          country_code: string | null
          created_at: string
          email: string | null
          external_id: string | null
          external_source: string | null
          id: string
          last_synced_at: string | null
          name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          source: string | null
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          email?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          last_synced_at?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          source?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          email?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          last_synced_at?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          source?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      commercial_quotes: {
        Row: {
          client_address: string | null
          client_city: string | null
          client_company: string | null
          client_country: string | null
          client_country_code: string | null
          client_email: string | null
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          client_postal_code: string | null
          client_vat_number: string | null
          created_at: string
          currency: string
          id: string
          is_business: boolean
          issue_date: string
          line_items: Json
          notes: string | null
          payment_terms: string | null
          quote_number: string
          reverse_charge_note: string | null
          source_quote_request_id: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
          valid_until: string | null
          vat_amount: number
          vat_rate: number
          vat_rule: string | null
          vies_address: string | null
          vies_checked_at: string | null
          vies_name: string | null
          vies_valid: boolean | null
        }
        Insert: {
          client_address?: string | null
          client_city?: string | null
          client_company?: string | null
          client_country?: string | null
          client_country_code?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          client_postal_code?: string | null
          client_vat_number?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_business?: boolean
          issue_date?: string
          line_items?: Json
          notes?: string | null
          payment_terms?: string | null
          quote_number: string
          reverse_charge_note?: string | null
          source_quote_request_id?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          valid_until?: string | null
          vat_amount?: number
          vat_rate?: number
          vat_rule?: string | null
          vies_address?: string | null
          vies_checked_at?: string | null
          vies_name?: string | null
          vies_valid?: boolean | null
        }
        Update: {
          client_address?: string | null
          client_city?: string | null
          client_company?: string | null
          client_country?: string | null
          client_country_code?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          client_postal_code?: string | null
          client_vat_number?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_business?: boolean
          issue_date?: string
          line_items?: Json
          notes?: string | null
          payment_terms?: string | null
          quote_number?: string
          reverse_charge_note?: string | null
          source_quote_request_id?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          valid_until?: string | null
          vat_amount?: number
          vat_rate?: number
          vat_rule?: string | null
          vies_address?: string | null
          vies_checked_at?: string | null
          vies_name?: string | null
          vies_valid?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "commercial_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_snapshots: {
        Row: {
          changes_summary: string | null
          competitor_id: string
          content_hash: string | null
          created_at: string
          has_changes: boolean
          id: string
          links_count: number | null
          markdown: string | null
          meta_description: string | null
          screenshot_url: string | null
          title: string | null
        }
        Insert: {
          changes_summary?: string | null
          competitor_id: string
          content_hash?: string | null
          created_at?: string
          has_changes?: boolean
          id?: string
          links_count?: number | null
          markdown?: string | null
          meta_description?: string | null
          screenshot_url?: string | null
          title?: string | null
        }
        Update: {
          changes_summary?: string | null
          competitor_id?: string
          content_hash?: string | null
          created_at?: string
          has_changes?: boolean
          id?: string
          links_count?: number | null
          markdown?: string | null
          meta_description?: string | null
          screenshot_url?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_snapshots_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_change_detected_at: string | null
          last_checked_at: string | null
          monitoring_mode: string
          name: string
          notes: string | null
          tags: string[] | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_change_detected_at?: string | null
          last_checked_at?: string | null
          monitoring_mode?: string
          name: string
          notes?: string | null
          tags?: string[] | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_change_detected_at?: string | null
          last_checked_at?: string | null
          monitoring_mode?: string
          name?: string
          notes?: string | null
          tags?: string[] | null
          updated_at?: string
          url?: string
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
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversion_events: {
        Row: {
          created_at: string
          event_label: string | null
          event_name: string
          event_type: string
          id: string
          metadata: Json | null
          page_path: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          event_label?: string | null
          event_name: string
          event_type: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          event_label?: string | null
          event_name?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      erp_settings: {
        Row: {
          address: string | null
          bank_holder: string | null
          bank_name: string | null
          bic: string | null
          city: string | null
          company_name: string
          country: string | null
          country_code: string | null
          created_at: string
          currency: string
          default_vat_rate: number
          email: string | null
          footer_notes: string | null
          iban: string | null
          id: string
          legal_name: string | null
          next_quote_number: number
          payment_terms: string | null
          phone: string | null
          postal_code: string | null
          quote_prefix: string | null
          updated_at: string
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          bank_holder?: string | null
          bank_name?: string | null
          bic?: string | null
          city?: string | null
          company_name?: string
          country?: string | null
          country_code?: string | null
          created_at?: string
          currency?: string
          default_vat_rate?: number
          email?: string | null
          footer_notes?: string | null
          iban?: string | null
          id?: string
          legal_name?: string | null
          next_quote_number?: number
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          quote_prefix?: string | null
          updated_at?: string
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          bank_holder?: string | null
          bank_name?: string | null
          bic?: string | null
          city?: string | null
          company_name?: string
          country?: string | null
          country_code?: string | null
          created_at?: string
          currency?: string
          default_vat_rate?: number
          email?: string | null
          footer_notes?: string | null
          iban?: string | null
          id?: string
          legal_name?: string | null
          next_quote_number?: number
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          quote_prefix?: string | null
          updated_at?: string
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      indexnow_pings: {
        Row: {
          created_at: string
          engine: string
          http_status: number | null
          id: string
          response: string | null
          status: string
          triggered_by: string | null
          url: string
        }
        Insert: {
          created_at?: string
          engine?: string
          http_status?: number | null
          id?: string
          response?: string | null
          status?: string
          triggered_by?: string | null
          url: string
        }
        Update: {
          created_at?: string
          engine?: string
          http_status?: number | null
          id?: string
          response?: string | null
          status?: string
          triggered_by?: string | null
          url?: string
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
      newsletter_campaigns: {
        Row: {
          bounces_count: number | null
          clicks_count: number | null
          created_at: string
          external_id: string | null
          html_content: string
          id: string
          name: string
          opens_count: number | null
          preview_text: string | null
          provider: string
          recipients_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          tags_filter: string[] | null
          updated_at: string
        }
        Insert: {
          bounces_count?: number | null
          clicks_count?: number | null
          created_at?: string
          external_id?: string | null
          html_content?: string
          id?: string
          name: string
          opens_count?: number | null
          preview_text?: string | null
          provider?: string
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          tags_filter?: string[] | null
          updated_at?: string
        }
        Update: {
          bounces_count?: number | null
          clicks_count?: number | null
          created_at?: string
          external_id?: string | null
          html_content?: string
          id?: string
          name?: string
          opens_count?: number | null
          preview_text?: string | null
          provider?: string
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          tags_filter?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          external_id: string | null
          id: string
          name: string | null
          provider: string
          source: string | null
          status: string
          subscribed_at: string
          tags: string[] | null
          unsubscribed_at: string | null
          updated_at: string
          utm_campaign: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          external_id?: string | null
          id?: string
          name?: string | null
          provider?: string
          source?: string | null
          status?: string
          subscribed_at?: string
          tags?: string[] | null
          unsubscribed_at?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          external_id?: string | null
          id?: string
          name?: string | null
          provider?: string
          source?: string | null
          status?: string
          subscribed_at?: string
          tags?: string[] | null
          unsubscribed_at?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          duration_seconds: number | null
          id: string
          ip_hash: string | null
          is_exit: boolean | null
          os: string | null
          page_path: string
          referrer: string | null
          region: string | null
          screen_size: string | null
          session_id: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          ip_hash?: string | null
          is_exit?: boolean | null
          os?: string | null
          page_path: string
          referrer?: string | null
          region?: string | null
          screen_size?: string | null
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          ip_hash?: string | null
          is_exit?: boolean | null
          os?: string | null
          page_path?: string
          referrer?: string | null
          region?: string | null
          screen_size?: string | null
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
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
      quote_requests: {
        Row: {
          ai_model: string | null
          ai_provider: string | null
          created_at: string
          currency: string
          details: string | null
          email: string
          id: string
          includes: string[]
          internal_notes: string | null
          is_read: boolean
          location: string
          max_amount: number | null
          min_amount: number | null
          name: string | null
          notes: string | null
          phone: string | null
          request_payload: Json | null
          response_payload: Json | null
          scope: string
          service: string
          source: string
          status: string
          summary: string | null
          updated_at: string
          urgency: string
          whatsapp_message: string | null
        }
        Insert: {
          ai_model?: string | null
          ai_provider?: string | null
          created_at?: string
          currency?: string
          details?: string | null
          email: string
          id?: string
          includes?: string[]
          internal_notes?: string | null
          is_read?: boolean
          location: string
          max_amount?: number | null
          min_amount?: number | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          scope: string
          service: string
          source?: string
          status?: string
          summary?: string | null
          updated_at?: string
          urgency: string
          whatsapp_message?: string | null
        }
        Update: {
          ai_model?: string | null
          ai_provider?: string | null
          created_at?: string
          currency?: string
          details?: string | null
          email?: string
          id?: string
          includes?: string[]
          internal_notes?: string | null
          is_read?: boolean
          location?: string
          max_amount?: number | null
          min_amount?: number | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          scope?: string
          service?: string
          source?: string
          status?: string
          summary?: string | null
          updated_at?: string
          urgency?: string
          whatsapp_message?: string | null
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
      seo_cities: {
        Row: {
          country: string
          created_at: string
          geo_lat: number | null
          geo_lng: number | null
          highlights: string[]
          id: string
          intro: string
          is_visible: boolean
          name: string
          order: number
          postal: string | null
          region: string
          slug: string
          updated_at: string
          zones: string[]
        }
        Insert: {
          country?: string
          created_at?: string
          geo_lat?: number | null
          geo_lng?: number | null
          highlights?: string[]
          id?: string
          intro?: string
          is_visible?: boolean
          name: string
          order?: number
          postal?: string | null
          region: string
          slug: string
          updated_at?: string
          zones?: string[]
        }
        Update: {
          country?: string
          created_at?: string
          geo_lat?: number | null
          geo_lng?: number | null
          highlights?: string[]
          id?: string
          intro?: string
          is_visible?: boolean
          name?: string
          order?: number
          postal?: string | null
          region?: string
          slug?: string
          updated_at?: string
          zones?: string[]
        }
        Relationships: []
      }
      seo_metadata: {
        Row: {
          created_at: string
          description: string | null
          id: string
          og_image: string | null
          page_path: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          og_image?: string | null
          page_path: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          og_image?: string | null
          page_path?: string
          title?: string | null
          updated_at?: string
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
      utm_links: {
        Row: {
          base_url: string
          click_count: number
          created_at: string
          created_by: string | null
          full_url: string
          id: string
          name: string
          notes: string | null
          short_code: string | null
          updated_at: string
          utm_campaign: string
          utm_content: string | null
          utm_medium: string
          utm_source: string
          utm_term: string | null
        }
        Insert: {
          base_url: string
          click_count?: number
          created_at?: string
          created_by?: string | null
          full_url: string
          id?: string
          name: string
          notes?: string | null
          short_code?: string | null
          updated_at?: string
          utm_campaign: string
          utm_content?: string | null
          utm_medium: string
          utm_source: string
          utm_term?: string | null
        }
        Update: {
          base_url?: string
          click_count?: number
          created_at?: string
          created_by?: string | null
          full_url?: string
          id?: string
          name?: string
          notes?: string | null
          short_code?: string | null
          updated_at?: string
          utm_campaign?: string
          utm_content?: string | null
          utm_medium?: string
          utm_source?: string
          utm_term?: string | null
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
