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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      add_ons: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          price_rands: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          price_rands: number
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          price_rands?: number
        }
        Relationships: []
      }
      blocked_dates: {
        Row: {
          created_at: string
          end_date: string
          id: string
          reason: string | null
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          account_number: string | null
          add_ons: Json
          bank_holder_name: string | null
          bank_name: string | null
          booking_date: string
          branch_code: string | null
          cancelled_at: string | null
          client_email: string
          client_name: string
          client_phone: string
          confirmed_at: string | null
          created_at: string
          deposit_amount: number
          discount_amount: number | null
          discount_percentage: number | null
          duration_type: string
          end_time: string
          final_total: number | null
          id: string
          id_document_url: string | null
          is_weekday: boolean
          notes: string | null
          package_type: string
          payfast_amount_gross: string | null
          payfast_payment_id: string | null
          promo_code: string | null
          shoot_type: string | null
          start_time: string
          status: string
          subtotal: number
          total_amount: number
        }
        Insert: {
          account_number?: string | null
          add_ons?: Json
          bank_holder_name?: string | null
          bank_name?: string | null
          booking_date: string
          branch_code?: string | null
          cancelled_at?: string | null
          client_email: string
          client_name: string
          client_phone: string
          confirmed_at?: string | null
          created_at?: string
          deposit_amount?: number
          discount_amount?: number | null
          discount_percentage?: number | null
          duration_type: string
          end_time: string
          final_total?: number | null
          id?: string
          id_document_url?: string | null
          is_weekday: boolean
          notes?: string | null
          package_type: string
          payfast_amount_gross?: string | null
          payfast_payment_id?: string | null
          promo_code?: string | null
          shoot_type?: string | null
          start_time: string
          status?: string
          subtotal: number
          total_amount: number
        }
        Update: {
          account_number?: string | null
          add_ons?: Json
          bank_holder_name?: string | null
          bank_name?: string | null
          booking_date?: string
          branch_code?: string | null
          cancelled_at?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string
          confirmed_at?: string | null
          created_at?: string
          deposit_amount?: number
          discount_amount?: number | null
          discount_percentage?: number | null
          duration_type?: string
          end_time?: string
          final_total?: number | null
          id?: string
          id_document_url?: string | null
          is_weekday?: boolean
          notes?: string | null
          package_type?: string
          payfast_amount_gross?: string | null
          payfast_payment_id?: string | null
          promo_code?: string | null
          shoot_type?: string | null
          start_time?: string
          status?: string
          subtotal?: number
          total_amount?: number
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          alt_text: string
          created_at: string
          display_order: number
          id: string
          url: string
        }
        Insert: {
          alt_text: string
          created_at?: string
          display_order?: number
          id?: string
          url: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          display_order?: number
          id?: string
          url?: string
        }
        Relationships: []
      }
      pricing: {
        Row: {
          duration_type: string
          id: string
          is_weekday: boolean
          package_type: string
          price_rands: number
        }
        Insert: {
          duration_type: string
          id?: string
          is_weekday: boolean
          package_type: string
          price_rands: number
        }
        Update: {
          duration_type?: string
          id?: string
          is_weekday?: boolean
          package_type?: string
          price_rands?: number
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          active: boolean | null
          code: string | null
          discount_percentage: number | null
          id: number
        }
        Insert: {
          active?: boolean | null
          code?: string | null
          discount_percentage?: number | null
          id?: number
        }
        Update: {
          active?: boolean | null
          code?: string | null
          discount_percentage?: number | null
          id?: number
        }
        Relationships: []
      }
      site_content: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
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
    Enums: {},
  },
} as const
