// AUTO-GENERATED — do not edit by hand.
// Regenerate after every migration:
//   npx supabase gen types typescript --project-id ngqolupfxhlekuixyyxb > src/types/database.ts
//
// This is a placeholder until the migration has been run and types are generated.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          created_at: string;
          client_name: string;
          client_email: string;
          client_phone: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          package_type: string;
          duration_type: string;
          is_weekday: boolean;
          shoot_type: string | null;
          add_ons: Json;
          subtotal: number;
          deposit_amount: number;
          total_amount: number;
          payfast_payment_id: string | null;
          payfast_amount_gross: string | null;
          status: "pending" | "confirmed" | "cancelled" | "no_show";
          confirmed_at: string | null;
          cancelled_at: string | null;
          id_document_url: string | null;
          bank_holder_name: string | null;
          bank_name: string | null;
          account_number: string | null;
          branch_code: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          client_name: string;
          client_email: string;
          client_phone: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          package_type: string;
          duration_type: string;
          is_weekday: boolean;
          shoot_type?: string | null;
          add_ons?: Json;
          subtotal: number;
          deposit_amount?: number;
          total_amount: number;
          payfast_payment_id?: string | null;
          payfast_amount_gross?: string | null;
          status?: "pending" | "confirmed" | "cancelled" | "no_show";
          confirmed_at?: string | null;
          cancelled_at?: string | null;
          id_document_url?: string | null;
          bank_holder_name?: string | null;
          bank_name?: string | null;
          account_number?: string | null;
          branch_code?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      pricing: {
        Row: {
          id: string;
          package_type: string;
          duration_type: string;
          is_weekday: boolean;
          price_rands: number;
        };
        Insert: {
          id?: string;
          package_type: string;
          duration_type: string;
          is_weekday: boolean;
          price_rands: number;
        };
        Update: Partial<Database["public"]["Tables"]["pricing"]["Insert"]>;
      };
      add_ons: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          description: string | null;
          price_rands: number;
          is_active: boolean;
          display_order: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          description?: string | null;
          price_rands: number;
          is_active?: boolean;
          display_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["add_ons"]["Insert"]>;
      };
      blocked_dates: {
        Row: {
          id: string;
          created_at: string;
          start_date: string;
          end_date: string;
          reason: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          start_date: string;
          end_date: string;
          reason?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["blocked_dates"]["Insert"]>;
      };
      site_content: {
        Row: {
          id: string;
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_content"]["Insert"]>;
      };
      gallery_images: {
        Row: {
          id: string;
          created_at: string;
          url: string;
          display_order: number;
          alt_text: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          url: string;
          display_order?: number;
          alt_text: string;
        };
        Update: Partial<Database["public"]["Tables"]["gallery_images"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
