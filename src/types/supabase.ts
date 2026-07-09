// ============================================================
// Supabase Database type definitions
// Generated manually to match migration schema
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: 'customer' | 'admin' | 'owner'
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          role?: 'customer' | 'admin' | 'owner'
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: 'customer' | 'admin' | 'owner'
          avatar_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      venues: {
        Row: {
          id: string
          name: string
          slug: string
          tier: 'simple' | 'premium' | 'luxurious'
          description: string
          short_description: string
          capacity_min: number
          capacity_max: number
          price_per_day: number
          price_half_day: number | null
          amenities: string[]
          images: string[]
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          tier?: 'simple' | 'premium' | 'luxurious'
          description: string
          short_description: string
          capacity_min?: number
          capacity_max: number
          price_per_day: number
          price_half_day?: number | null
          amenities?: string[]
          images?: string[]
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          tier?: 'simple' | 'premium' | 'luxurious'
          description?: string
          short_description?: string
          capacity_min?: number
          capacity_max?: number
          price_per_day?: number
          price_half_day?: number | null
          amenities?: string[]
          images?: string[]
          is_active?: boolean
          display_order?: number
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          booking_ref: string
          customer_id: string
          venue_id: string
          event_date: string
          event_type: 'wedding' | 'reception' | 'engagement' | 'birthday' | 'corporate' | 'other'
          guest_count: number
          customer_name: string
          customer_phone: string
          customer_email: string
          status: 'pending_payment' | 'pending_verification' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'expired'
          base_price: number
          advance_amount: number
          total_amount: number
          override_price: number | null
          notes: string | null
          cancellation_reason: string | null
          cancelled_by: string | null
          cancelled_at: string | null
          completed_at: string | null
          expires_at: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_ref?: string
          customer_id: string
          venue_id: string
          event_date: string
          event_type: 'wedding' | 'reception' | 'engagement' | 'birthday' | 'corporate' | 'other'
          guest_count: number
          customer_name: string
          customer_phone: string
          customer_email: string
          status?: 'pending_payment' | 'pending_verification' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'expired'
          base_price: number
          advance_amount: number
          total_amount: number
          override_price?: number | null
          notes?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          expires_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          venue_id?: string
          event_date?: string
          event_type?: 'wedding' | 'reception' | 'engagement' | 'birthday' | 'corporate' | 'other'
          guest_count?: number
          customer_name?: string
          customer_phone?: string
          customer_email?: string
          status?: 'pending_payment' | 'pending_verification' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'expired'
          base_price?: number
          advance_amount?: number
          total_amount?: number
          override_price?: number | null
          notes?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          expires_at?: string | null
          deleted_at?: string | null
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          customer_id: string
          method: 'upi' | 'cash'
          amount: number
          transaction_id: string | null
          screenshot_url: string | null
          status: 'pending' | 'verified' | 'rejected'
          rejection_reason: string | null
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          customer_id: string
          method: 'upi' | 'cash'
          amount: number
          transaction_id?: string | null
          screenshot_url?: string | null
          status?: 'pending' | 'verified' | 'rejected'
          rejection_reason?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'verified' | 'rejected'
          rejection_reason?: string | null
          verified_by?: string | null
          verified_at?: string | null
          transaction_id?: string | null
          screenshot_url?: string | null
          updated_at?: string
        }
      }
      blocked_dates: {
        Row: {
          id: string
          venue_id: string | null
          blocked_date: string
          reason: string | null
          blocked_by: string
          created_at: string
        }
        Insert: {
          id?: string
          venue_id?: string | null
          blocked_date: string
          reason?: string | null
          blocked_by: string
          created_at?: string
        }
        Update: {
          venue_id?: string | null
          blocked_date?: string
          reason?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'booking_received' | 'booking_confirmed' | 'booking_rejected' | 'booking_cancelled' | 'booking_expired' | 'payment_received' | 'payment_verified' | 'payment_rejected' | 'reminder' | 'general'
          title: string
          message: string
          booking_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'booking_received' | 'booking_confirmed' | 'booking_rejected' | 'booking_cancelled' | 'booking_expired' | 'payment_received' | 'payment_verified' | 'payment_rejected' | 'reminder' | 'general'
          title: string
          message: string
          booking_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
      }
      gallery: {
        Row: {
          id: string
          url: string
          thumbnail_url: string | null
          caption: string | null
          category: 'weddings' | 'receptions' | 'engagements' | 'decor' | 'venue' | 'other'
          venue_id: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          url: string
          thumbnail_url?: string | null
          caption?: string | null
          category?: 'weddings' | 'receptions' | 'engagements' | 'decor' | 'venue' | 'other'
          venue_id?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          url?: string
          thumbnail_url?: string | null
          caption?: string | null
          category?: 'weddings' | 'receptions' | 'engagements' | 'decor' | 'venue' | 'other'
          venue_id?: string | null
          display_order?: number
          is_active?: boolean
          updated_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          customer_name: string
          event_type: 'wedding' | 'reception' | 'engagement' | 'birthday' | 'corporate' | 'other'
          event_date: string | null
          rating: number
          message: string
          avatar_url: string | null
          venue_id: string | null
          is_active: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          event_type: 'wedding' | 'reception' | 'engagement' | 'birthday' | 'corporate' | 'other'
          event_date?: string | null
          rating: number
          message: string
          avatar_url?: string | null
          venue_id?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          customer_name?: string
          event_type?: 'wedding' | 'reception' | 'engagement' | 'birthday' | 'corporate' | 'other'
          event_date?: string | null
          rating?: number
          message?: string
          avatar_url?: string | null
          venue_id?: string | null
          is_active?: boolean
          display_order?: number
        }
      }
      hall_settings: {
        Row: {
          id: string
          key: string
          value: string
          description: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          description?: string | null
          updated_at?: string
        }
        Update: {
          value?: string
          description?: string | null
          updated_at?: string
        }
      }
      email_logs: {
        Row: {
          id: string
          booking_id: string | null
          recipient: string
          template: string
          subject: string
          status: string
          error_message: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id?: string | null
          recipient: string
          template: string
          subject: string
          status?: string
          error_message?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          status?: string
          error_message?: string | null
          sent_at?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_owner: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'customer' | 'admin' | 'owner'
      booking_status: 'pending_payment' | 'pending_verification' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'expired'
      payment_method: 'upi' | 'cash'
      payment_status: 'pending' | 'verified' | 'rejected'
      event_type: 'wedding' | 'reception' | 'engagement' | 'birthday' | 'corporate' | 'other'
      venue_tier: 'simple' | 'premium' | 'luxurious'
      notification_type: 'booking_received' | 'booking_confirmed' | 'booking_rejected' | 'booking_cancelled' | 'booking_expired' | 'payment_received' | 'payment_verified' | 'payment_rejected' | 'reminder' | 'general'
      gallery_category: 'weddings' | 'receptions' | 'engagements' | 'decor' | 'venue' | 'other'
    }
  }
}
