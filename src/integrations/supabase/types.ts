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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      availability_slots: {
        Row: {
          created_at: string | null
          current_bookings: number | null
          id: string
          is_available: boolean | null
          max_bookings: number | null
          slot_date: string
          slot_time: string
        }
        Insert: {
          created_at?: string | null
          current_bookings?: number | null
          id?: string
          is_available?: boolean | null
          max_bookings?: number | null
          slot_date: string
          slot_time: string
        }
        Update: {
          created_at?: string | null
          current_bookings?: number | null
          id?: string
          is_available?: boolean | null
          max_bookings?: number | null
          slot_date?: string
          slot_time?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string | null
          id: string
          selected_date: string
          selected_time: string
          status: Database["public"]["Enums"]["booking_status"]
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          total_amount: number
          updated_at: string | null
          user_email: string
          user_phone: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          selected_date: string
          selected_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          total_amount: number
          updated_at?: string | null
          user_email: string
          user_phone?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          selected_date?: string
          selected_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          total_amount?: number
          updated_at?: string | null
          user_email?: string
          user_phone?: string | null
        }
        Relationships: []
      }
      intake_forms: {
        Row: {
          arrival_date: string | null
          booking_id: string
          cancellation_policy_acknowledged: boolean | null
          capsule_endoscopy_reason: string | null
          checkup_reason: string | null
          chronic_diseases_details: string | null
          created_at: string | null
          extra_fees_acknowledged: boolean | null
          has_chronic_diseases: boolean | null
          has_major_surgeries: boolean | null
          how_heard_about: string | null
          id: string
          major_surgeries_details: string | null
          needs_airport_pickup: boolean | null
          needs_hotel_help: boolean | null
          passport_photo_url: string | null
          payment_capture_acknowledged: boolean | null
          preferred_hotel: string | null
          updated_at: string | null
          wants_capsule_endoscopy: boolean | null
        }
        Insert: {
          arrival_date?: string | null
          booking_id: string
          cancellation_policy_acknowledged?: boolean | null
          capsule_endoscopy_reason?: string | null
          checkup_reason?: string | null
          chronic_diseases_details?: string | null
          created_at?: string | null
          extra_fees_acknowledged?: boolean | null
          has_chronic_diseases?: boolean | null
          has_major_surgeries?: boolean | null
          how_heard_about?: string | null
          id?: string
          major_surgeries_details?: string | null
          needs_airport_pickup?: boolean | null
          needs_hotel_help?: boolean | null
          passport_photo_url?: string | null
          payment_capture_acknowledged?: boolean | null
          preferred_hotel?: string | null
          updated_at?: string | null
          wants_capsule_endoscopy?: boolean | null
        }
        Update: {
          arrival_date?: string | null
          booking_id?: string
          cancellation_policy_acknowledged?: boolean | null
          capsule_endoscopy_reason?: string | null
          checkup_reason?: string | null
          chronic_diseases_details?: string | null
          created_at?: string | null
          extra_fees_acknowledged?: boolean | null
          has_chronic_diseases?: boolean | null
          has_major_surgeries?: boolean | null
          how_heard_about?: string | null
          id?: string
          major_surgeries_details?: string | null
          needs_airport_pickup?: boolean | null
          needs_hotel_help?: boolean | null
          passport_photo_url?: string | null
          payment_capture_acknowledged?: boolean | null
          preferred_hotel?: string | null
          updated_at?: string | null
          wants_capsule_endoscopy?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "intake_forms_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
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
      booking_status:
        | "pending_payment"
        | "payment_authorized"
        | "intake_submitted"
        | "under_review"
        | "confirmed"
        | "cancelled"
        | "completed"
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
      booking_status: [
        "pending_payment",
        "payment_authorized",
        "intake_submitted",
        "under_review",
        "confirmed",
        "cancelled",
        "completed",
      ],
    },
  },
} as const
