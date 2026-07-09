// ============================================================
// Database Types — auto-aligned with Supabase schema
// ============================================================

export type UserRole = 'customer' | 'admin' | 'owner'
export type BookingStatus =
  | 'pending_payment'
  | 'pending_verification'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'expired'
export type PaymentMethod = 'upi' | 'cash'
export type PaymentStatus = 'pending' | 'verified' | 'rejected'
export type EventType =
  | 'wedding'
  | 'reception'
  | 'engagement'
  | 'birthday'
  | 'corporate'
  | 'other'
export type VenueTier = 'simple' | 'premium' | 'luxurious'
export type NotificationType =
  | 'booking_received'
  | 'booking_confirmed'
  | 'booking_rejected'
  | 'booking_cancelled'
  | 'booking_expired'
  | 'payment_received'
  | 'payment_verified'
  | 'payment_rejected'
  | 'reminder'
  | 'general'
export type GalleryCategory =
  | 'weddings'
  | 'receptions'
  | 'engagements'
  | 'decor'
  | 'venue'
  | 'other'

// ============================================================
// DB Row Types (mirrors DB columns exactly)
// ============================================================

export interface DbProfile {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DbVenue {
  id: string
  name: string
  slug: string
  tier: VenueTier
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

export interface DbBooking {
  id: string
  booking_ref: string
  customer_id: string
  venue_id: string
  event_date: string // ISO date string YYYY-MM-DD
  event_type: EventType
  guest_count: number
  customer_name: string
  customer_phone: string
  customer_email: string
  status: BookingStatus
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

export interface DbPayment {
  id: string
  booking_id: string
  customer_id: string
  method: PaymentMethod
  amount: number
  transaction_id: string | null
  screenshot_url: string | null
  status: PaymentStatus
  rejection_reason: string | null
  verified_by: string | null
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface DbBlockedDate {
  id: string
  venue_id: string | null
  blocked_date: string // YYYY-MM-DD
  reason: string | null
  blocked_by: string
  created_at: string
}

export interface DbNotification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  booking_id: string | null
  is_read: boolean
  created_at: string
}

export interface DbGallery {
  id: string
  url: string
  thumbnail_url: string | null
  caption: string | null
  category: GalleryCategory
  venue_id: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DbTestimonial {
  id: string
  customer_name: string
  event_type: EventType
  event_date: string | null
  rating: number
  message: string
  avatar_url: string | null
  venue_id: string | null
  is_active: boolean
  display_order: number
  created_at: string
}

export interface DbHallSetting {
  id: string
  key: string
  value: string
  description: string | null
  updated_at: string
}

export interface DbEmailLog {
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

// ============================================================
// Enriched / joined types
// ============================================================

export interface BookingWithVenue extends DbBooking {
  venue: DbVenue
}

export interface BookingWithDetails extends DbBooking {
  venue: DbVenue
  customer: DbProfile
  payments: DbPayment[]
}

export interface PaymentWithBooking extends DbPayment {
  booking: BookingWithVenue
  customer: DbProfile
}

// ============================================================
// API Response Wrapper
// ============================================================

export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: string }

// ============================================================
// Hall Settings map (typed key-value)
// ============================================================

export interface HallSettings {
  hall_name: string
  hall_tagline: string
  hall_phone: string
  hall_phone_alt: string
  hall_email: string
  hall_address_line1: string
  hall_address_line2: string
  hall_city: string
  hall_state: string
  hall_pincode: string
  hall_google_maps_url: string
  hall_upi_id: string
  hall_upi_name: string
  hall_upi_qr_url: string
  hall_about: string
  hall_established_year: string
  hall_events_count: string
  hall_years_experience: string
  advance_payment_percent: string
  booking_expiry_hours: string
  min_advance_days: string
  max_advance_days: string
  cancellation_policy: string
  social_facebook: string
  social_instagram: string
  social_whatsapp: string
  admin_notification_email: string
}

// ============================================================
// Booking Flow / Form types
// ============================================================

export interface BookingStep1Data {
  venueId: string
  eventDate: string // YYYY-MM-DD
}

export interface BookingStep2Data {
  customerName: string
  customerPhone: string
  customerEmail: string
  eventType: EventType
  guestCount: number
  notes: string
}

export interface BookingStep3Data {
  agreed: boolean
}

export interface BookingStep4Data {
  paymentMethod: PaymentMethod
  transactionId: string
  screenshotFile: File | null
}

export interface BookingFormState {
  step: 1 | 2 | 3 | 4
  step1: Partial<BookingStep1Data>
  step2: Partial<BookingStep2Data>
  step3: Partial<BookingStep3Data>
  step4: Partial<BookingStep4Data>
  selectedVenue: DbVenue | null
  pricingBreakdown: PricingBreakdown | null
}

export interface PricingBreakdown {
  basePrice: number
  advancePercent: number
  advanceAmount: number
  balanceAmount: number
  totalAmount: number
}

// ============================================================
// Dashboard / Reports types
// ============================================================

export interface DashboardStats {
  totalBookings: number
  confirmedBookings: number
  pendingVerification: number
  totalRevenue: number
  monthlyRevenue: number
  upcomingEvents: number
  trendsVsLastMonth: {
    bookings: number
    revenue: number
  }
}

export interface RevenueByMonth {
  month: string // e.g. "Jan 2025"
  revenue: number
  bookings: number
}

export interface RevenueByVenue {
  venueName: string
  revenue: number
  bookings: number
}

export interface OccupancyData {
  date: string
  venueId: string
  venueName: string
  status: 'booked' | 'blocked' | 'available'
}
