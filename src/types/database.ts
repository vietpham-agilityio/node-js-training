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
      bookings: {
        Row: {
          booking_number: string
          booking_status: string | null
          created_at: string | null
          discount_amount: number | null
          expires_at: string | null
          id: string
          payment_method: string | null
          payment_status: string | null
          promo_code_id: string | null
          qr_code_data: string | null
          seat_numbers: string[]
          showtime_id: string
          subtotal: number
          total_amount: number
          total_seats: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_number: string
          booking_status?: string | null
          created_at?: string | null
          discount_amount?: number | null
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          promo_code_id?: string | null
          qr_code_data?: string | null
          seat_numbers: string[]
          showtime_id: string
          subtotal: number
          total_amount: number
          total_seats: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_number?: string
          booking_status?: string | null
          created_at?: string | null
          discount_amount?: number | null
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          promo_code_id?: string | null
          qr_code_data?: string | null
          seat_numbers?: string[]
          showtime_id?: string
          subtotal?: number
          total_amount?: number
          total_seats?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_showtime_id_fkey"
            columns: ["showtime_id"]
            isOneToOne: false
            referencedRelation: "showtimes"
            referencedColumns: ["id"]
          },
        ]
      }
      cinema_halls: {
        Row: {
          cinema_id: string
          created_at: string | null
          hall_type: string | null
          id: string
          is_active: boolean | null
          name: string
          seat_layout: Json | null
          total_seats: number
          updated_at: string | null
        }
        Insert: {
          cinema_id: string
          created_at?: string | null
          hall_type?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          seat_layout?: Json | null
          total_seats: number
          updated_at?: string | null
        }
        Update: {
          cinema_id?: string
          created_at?: string | null
          hall_type?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          seat_layout?: Json | null
          total_seats?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cinema_halls_cinema_id_fkey"
            columns: ["cinema_id"]
            isOneToOne: false
            referencedRelation: "cinemas"
            referencedColumns: ["id"]
          },
        ]
      }
      cinemas: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          facilities: string[] | null
          id: string
          is_active: boolean | null
          location: string
          name: string
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          facilities?: string[] | null
          id?: string
          is_active?: boolean | null
          location: string
          name: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          facilities?: string[] | null
          id?: string
          is_active?: boolean | null
          location?: string
          name?: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      movies: {
        Row: {
          cast_crew: Json | null
          created_at: string | null
          duration_minutes: number
          genre: string[] | null
          id: string
          language: string | null
          poster_url: string
          rating: number | null
          release_date: string
          status: string | null
          synopsis: string | null
          title: string
          trailer_url: string[] | null
          updated_at: string | null
        }
        Insert: {
          cast_crew?: Json | null
          created_at?: string | null
          duration_minutes: number
          genre?: string[] | null
          id?: string
          language?: string | null
          poster_url: string
          rating?: number | null
          release_date: string
          status?: string | null
          synopsis?: string | null
          title: string
          trailer_url?: string[] | null
          updated_at?: string | null
        }
        Update: {
          cast_crew?: Json | null
          created_at?: string | null
          duration_minutes?: number
          genre?: string[] | null
          id?: string
          language?: string | null
          poster_url?: string
          rating?: number | null
          release_date?: string
          status?: string | null
          synopsis?: string | null
          title?: string
          trailer_url?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          body: string
          data: Json | null
          id: string
          notification_type: string
          sent_at: string | null
          status: string | null
          ticket_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          data?: Json | null
          id?: string
          notification_type: string
          sent_at?: string | null
          status?: string | null
          ticket_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          data?: Json | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          status?: string | null
          ticket_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_code_usage: {
        Row: {
          booking_id: string | null
          discount_amount: number
          id: string
          promo_code_id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          discount_amount: number
          id?: string
          promo_code_id: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string | null
          discount_amount?: number
          id?: string
          promo_code_id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_usage_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_purchase_amount: number | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from: string
          valid_until: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string | null
          device_id: string | null
          expo_push_token: string
          id: string
          is_active: boolean | null
          platform: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          expo_push_token: string
          id?: string
          is_active?: boolean | null
          platform: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          expo_push_token?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      seat_reservations: {
        Row: {
          created_at: string | null
          id: string
          reserved_until: string
          seat_numbers: string[]
          showtime_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reserved_until: string
          seat_numbers: string[]
          showtime_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reserved_until?: string
          seat_numbers?: string[]
          showtime_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seat_reservations_showtime_id_fkey"
            columns: ["showtime_id"]
            isOneToOne: false
            referencedRelation: "showtimes"
            referencedColumns: ["id"]
          },
        ]
      }
      showtimes: {
        Row: {
          available_seats: number
          cinema_hall_id: string
          created_at: string | null
          end_time: string
          id: string
          movie_id: string
          price: number
          show_date: string
          show_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          available_seats: number
          cinema_hall_id: string
          created_at?: string | null
          end_time: string
          id?: string
          movie_id: string
          price: number
          show_date: string
          show_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          available_seats?: number
          cinema_hall_id?: string
          created_at?: string | null
          end_time?: string
          id?: string
          movie_id?: string
          price?: number
          show_date?: string
          show_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "showtimes_cinema_hall_id_fkey"
            columns: ["cinema_hall_id"]
            isOneToOne: false
            referencedRelation: "cinema_halls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showtimes_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          booking_id: string
          created_at: string | null
          id: string
          price: number
          qr_code_data: string
          scanned_at: string | null
          seat_number: string
          status: string | null
          ticket_number: string
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          id?: string
          price: number
          qr_code_data: string
          scanned_at?: string | null
          seat_number: string
          status?: string | null
          ticket_number: string
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          id?: string
          price?: number
          qr_code_data?: string
          scanned_at?: string | null
          seat_number?: string
          status?: string | null
          ticket_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_oauth_providers: {
        Row: {
          created_at: string | null
          id: string
          provider: string
          provider_user_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          provider: string
          provider_user_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          provider?: string
          provider_user_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          full_name: string
          id: string
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name: string
          id: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          status: string | null
          transaction_type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: string | null
          transaction_type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: string | null
          transaction_type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_reference_id_fkey"
            columns: ["reference_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number | null
          card_number: string | null
          created_at: string | null
          currency: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          card_number?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          card_number?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deactivate_old_push_tokens: { Args: never; Returns: undefined }
      decrement_available_seats: {
        Args: { seats_count: number; showtime_id: string }
        Returns: undefined
      }
      expire_old_tickets: { Args: never; Returns: undefined }
      generate_booking_number: { Args: never; Returns: string }
      generate_qr_code_data: {
        Args: {
          p_booking_id: string
          p_seat_number: string
          p_ticket_id: string
        }
        Returns: string
      }
      generate_ticket_number: { Args: never; Returns: string }
      increment_balance: {
        Args: { amount: number; wallet_id: string }
        Returns: number
      }
      release_expired_reservations: { Args: never; Returns: undefined }
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
