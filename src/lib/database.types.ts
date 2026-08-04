export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type TableDefinition<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationship[];
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      categories: TableDefinition<
        {
          id: number;
          slug: string;
          name: string;
          group_name: string;
          kind: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        },
        {
          id?: number;
          slug: string;
          name: string;
          group_name: string;
          kind?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        },
        {
          id?: number;
          slug?: string;
          name?: string;
          group_name?: string;
          kind?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        }
      >;
      profiles: TableDefinition<
        {
          id: string;
          full_name: string;
          phone: string | null;
          province: string | null;
          locality: string | null;
          avatar_url: string | null;
          bio: string | null;
          work_radius_km: number;
          identity_verified: boolean;
          phone_verified: boolean;
          created_at: string;
          updated_at: string;
          headline: string | null;
          experience_text: string | null;
          availability_text: string | null;
          cv_storage_path: string | null;
        },
        {
          id: string;
          full_name?: string;
          phone?: string | null;
          province?: string | null;
          locality?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          work_radius_km?: number;
          identity_verified?: boolean;
          phone_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          headline?: string | null;
          experience_text?: string | null;
          availability_text?: string | null;
          cv_storage_path?: string | null;
        },
        {
          id?: string;
          full_name?: string;
          phone?: string | null;
          province?: string | null;
          locality?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          work_radius_km?: number;
          identity_verified?: boolean;
          phone_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          headline?: string | null;
          experience_text?: string | null;
          availability_text?: string | null;
          cv_storage_path?: string | null;
        }
      >;
      profile_cards: TableDefinition<
        {
          id: string;
          full_name: string;
          province: string | null;
          locality: string | null;
          avatar_url: string | null;
          bio: string | null;
          work_radius_km: number;
          identity_verified: boolean;
          phone_verified: boolean;
          updated_at: string;
          headline: string | null;
          experience_text: string | null;
          availability_text: string | null;
        },
        {
          id: string;
          full_name?: string;
          province?: string | null;
          locality?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          work_radius_km?: number;
          identity_verified?: boolean;
          phone_verified?: boolean;
          updated_at?: string;
          headline?: string | null;
          experience_text?: string | null;
          availability_text?: string | null;
        },
        {
          id?: string;
          full_name?: string;
          province?: string | null;
          locality?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          work_radius_km?: number;
          identity_verified?: boolean;
          phone_verified?: boolean;
          updated_at?: string;
          headline?: string | null;
          experience_text?: string | null;
          availability_text?: string | null;
        }
      >;
      job_posts: TableDefinition<
        {
          id: string;
          author_id: string;
          category_id: number;
          kind: string;
          title: string;
          description: string;
          province: string;
          locality: string;
          zone_reference: string | null;
          desired_date: string | null;
          urgency: string;
          budget_mode: string;
          budget_min: number | null;
          budget_max: number | null;
          currency: string;
          status: string;
          published_at: string;
          created_at: string;
          updated_at: string;
          assigned_proposal_id: string | null;
          is_wall_visible: boolean;
          schedule_text: string | null;
          expires_at: string | null;
        },
        {
          id?: string;
          author_id: string;
          category_id: number;
          kind?: string;
          title: string;
          description: string;
          province: string;
          locality: string;
          zone_reference?: string | null;
          desired_date?: string | null;
          urgency?: string;
          budget_mode?: string;
          budget_min?: number | null;
          budget_max?: number | null;
          currency?: string;
          status?: string;
          published_at?: string;
          created_at?: string;
          updated_at?: string;
          assigned_proposal_id?: string | null;
          is_wall_visible?: boolean;
          schedule_text?: string | null;
          expires_at?: string | null;
        },
        {
          id?: string;
          author_id?: string;
          category_id?: number;
          kind?: string;
          title?: string;
          description?: string;
          province?: string;
          locality?: string;
          zone_reference?: string | null;
          desired_date?: string | null;
          urgency?: string;
          budget_mode?: string;
          budget_min?: number | null;
          budget_max?: number | null;
          currency?: string;
          status?: string;
          published_at?: string;
          created_at?: string;
          updated_at?: string;
          assigned_proposal_id?: string | null;
          is_wall_visible?: boolean;
          schedule_text?: string | null;
          expires_at?: string | null;
        }
      >;
      proposals: TableDefinition<
        {
          id: string;
          post_id: string;
          proposer_id: string;
          amount: number | null;
          amount_unit: string;
          message: string;
          includes_text: string | null;
          availability_text: string | null;
          estimated_time_text: string | null;
          warranty_text: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          post_id: string;
          proposer_id: string;
          amount?: number | null;
          amount_unit?: string;
          message: string;
          includes_text?: string | null;
          availability_text?: string | null;
          estimated_time_text?: string | null;
          warranty_text?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          post_id?: string;
          proposer_id?: string;
          amount?: number | null;
          amount_unit?: string;
          message?: string;
          includes_text?: string | null;
          availability_text?: string | null;
          estimated_time_text?: string | null;
          warranty_text?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      job_images: TableDefinition<
        {
          id: string;
          post_id: string;
          owner_id: string;
          storage_path: string;
          sort_order: number;
          created_at: string;
        },
        {
          id?: string;
          post_id: string;
          owner_id: string;
          storage_path: string;
          sort_order?: number;
          created_at?: string;
        },
        {
          id?: string;
          post_id?: string;
          owner_id?: string;
          storage_path?: string;
          sort_order?: number;
          created_at?: string;
        }
      >;
      businesses: TableDefinition<
        {
          id: string;
          owner_id: string | null;
          slug: string;
          name: string;
          description: string | null;
          logo_url: string | null;
          cover_url: string | null;
          phone: string | null;
          whatsapp: string | null;
          website_url: string | null;
          instagram_url: string | null;
          address_text: string | null;
          province: string | null;
          locality: string | null;
          is_verified: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          owner_id?: string | null;
          slug: string;
          name: string;
          description?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          website_url?: string | null;
          instagram_url?: string | null;
          address_text?: string | null;
          province?: string | null;
          locality?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          owner_id?: string | null;
          slug?: string;
          name?: string;
          description?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          website_url?: string | null;
          instagram_url?: string | null;
          address_text?: string | null;
          province?: string | null;
          locality?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      business_categories: TableDefinition<
        { business_id: string; category_id: number; created_at: string },
        { business_id: string; category_id: number; created_at?: string },
        { business_id?: string; category_id?: number; created_at?: string }
      >;
      ad_campaigns: TableDefinition<
        {
          id: string;
          business_id: string;
          internal_name: string;
          placement: string;
          title: string;
          body: string | null;
          image_url: string | null;
          cta_label: string | null;
          cta_url: string | null;
          coupon_code: string | null;
          province: string | null;
          locality: string | null;
          category_id: number | null;
          group_name: string | null;
          status: string;
          priority: number;
          starts_at: string;
          ends_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          business_id: string;
          internal_name: string;
          placement: string;
          title: string;
          body?: string | null;
          image_url?: string | null;
          cta_label?: string | null;
          cta_url?: string | null;
          coupon_code?: string | null;
          province?: string | null;
          locality?: string | null;
          category_id?: number | null;
          group_name?: string | null;
          status?: string;
          priority?: number;
          starts_at?: string;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          business_id?: string;
          internal_name?: string;
          placement?: string;
          title?: string;
          body?: string | null;
          image_url?: string | null;
          cta_label?: string | null;
          cta_url?: string | null;
          coupon_code?: string | null;
          province?: string | null;
          locality?: string | null;
          category_id?: number | null;
          group_name?: string | null;
          status?: string;
          priority?: number;
          starts_at?: string;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      ad_events: TableDefinition<
        {
          id: number;
          campaign_id: string;
          event_type: string;
          category_id: number | null;
          locality: string | null;
          placement: string | null;
          anonymous_session_hash: string | null;
          occurred_at: string;
        },
        {
          id?: never;
          campaign_id: string;
          event_type: string;
          category_id?: number | null;
          locality?: string | null;
          placement?: string | null;
          anonymous_session_hash?: string | null;
          occurred_at?: string;
        },
        {
          id?: never;
          campaign_id?: string;
          event_type?: string;
          category_id?: number | null;
          locality?: string | null;
          placement?: string | null;
          anonymous_session_hash?: string | null;
          occurred_at?: string;
        }
      >;
      app_config: TableDefinition<
        { key: string; value: string; updated_at: string },
        { key: string; value: string; updated_at?: string },
        { key?: string; value?: string; updated_at?: string }
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      accept_proposal: { Args: { p_proposal_id: string }; Returns: undefined };
      get_contextual_ads: {
        Args: {
          p_placement: string;
          p_category_id?: number | null;
          p_group_name?: string | null;
          p_locality?: string | null;
          p_province?: string | null;
          p_limit?: number;
        };
        Returns: {
          campaign_id: string;
          business_id: string;
          business_name: string;
          business_logo_url: string | null;
          business_verified: boolean;
          placement: string;
          title: string;
          body: string | null;
          image_url: string | null;
          cta_label: string | null;
          cta_url: string | null;
          coupon_code: string | null;
          category_id: number | null;
          group_name: string | null;
          locality: string | null;
          province: string | null;
          relevance_score: number;
        }[];
      };
      get_public_stats: { Args: Record<PropertyKey, never>; Returns: Json };
      healthcheck_altoque: { Args: Record<PropertyKey, never>; Returns: Json };
      record_ad_event: {
        Args: {
          p_campaign_id: string;
          p_event_type: string;
          p_category_id?: number | null;
          p_locality?: string | null;
          p_placement?: string | null;
          p_session_token?: string | null;
        };
        Returns: undefined;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
