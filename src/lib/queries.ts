import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'
import { buildSettingsMap } from '@/lib/utils'
import type {
  ApiResponse,
  DbVenue,
  DbBooking,
  BookingWithDetails,
  HallSettings,
  DbGallery,
  DbTestimonial,
  DbBlockedDate,
  DbNotification,
  BookingWithVenue,
} from '@/types/database'

// ============================================================
// Hall Settings
// ============================================================

export async function getHallSettings(): Promise<HallSettings> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('hall_settings')
    .select('key, value')

  if (error || !data) {
    // Return defaults so pages never crash
    return {} as HallSettings
  }

  return buildSettingsMap(data) as HallSettings
}

// ============================================================
// Venues
// ============================================================

export async function getActiveVenues(): Promise<ApiResponse<DbVenue[]>> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) return { data: null, error: error.message }
  return { data: data ?? [], error: null }
}

export async function getVenueBySlug(slug: string): Promise<ApiResponse<DbVenue>> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function getAllVenuesAdmin(): Promise<ApiResponse<DbVenue[]>> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) return { data: null, error: error.message }
  return { data: data ?? [], error: null }
}

// ============================================================
// Availability
// ============================================================

export async function getBookedDates(
  venueId?: string
): Promise<ApiResponse<{ event_date: string; venue_id: string }[]>> {
  const supabase = createSupabaseServerClient()

  let query = supabase
    .from('bookings')
    .select('event_date, venue_id')
    .is('deleted_at', null)
    .not('status', 'in', '("cancelled","rejected","expired")')

  if (venueId) {
    query = query.eq('venue_id', venueId)
  }

  const { data, error } = await query
  if (error) return { data: null, error: error.message }
  return { data: data ?? [], error: null }
}

export async function getBlockedDates(
  venueId?: string
): Promise<ApiResponse<DbBlockedDate[]>> {
  const supabase = createSupabaseServerClient()

  let query = supabase.from('blocked_dates').select('*')

  if (venueId) {
    query = query.or(`venue_id.eq.${venueId},venue_id.is.null`)
  }

  const { data, error } = await query.order('blocked_date', { ascending: true })
  if (error) return { data: null, error: error.message }
  return { data: data ?? [], error: null }
}

// ============================================================
// Bookings — Customer
// ============================================================

export async function getCustomerBookings(
  customerId: string
): Promise<ApiResponse<BookingWithVenue[]>> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, venue:venues(*)')
    .eq('customer_id', customerId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data: (data as BookingWithVenue[]) ?? [], error: null }
}

export async function getBookingByRef(
  bookingRef: string,
  customerId?: string
): Promise<ApiResponse<BookingWithDetails>> {
  const supabase = createSupabaseServerClient()

  let query = supabase
    .from('bookings')
    .select('*, venue:venues(*), customer:profiles(*), payments(*)')
    .eq('booking_ref', bookingRef)
    .is('deleted_at', null)

  if (customerId) {
    query = query.eq('customer_id', customerId)
  }

  const { data, error } = await query.single()
  if (error) return { data: null, error: error.message }
  return { data: data as BookingWithDetails, error: null }
}

// ============================================================
// Bookings — Admin
// ============================================================

export async function getAllBookingsAdmin(filters?: {
  status?: string
  venueId?: string
  fromDate?: string
  toDate?: string
  search?: string
  page?: number
  limit?: number
}): Promise<ApiResponse<{ bookings: BookingWithDetails[]; total: number }>> {
  const supabase = createSupabaseServerClient()

  const page = filters?.page ?? 1
  const limit = filters?.limit ?? 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('bookings')
    .select('*, venue:venues(*), customer:profiles(*), payments(*)', { count: 'exact' })
    .is('deleted_at', null)

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.venueId) query = query.eq('venue_id', filters.venueId)
  if (filters?.fromDate) query = query.gte('event_date', filters.fromDate)
  if (filters?.toDate) query = query.lte('event_date', filters.toDate)
  if (filters?.search) {
    query = query.or(
      `booking_ref.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`
    )
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) return { data: null, error: error.message }
  return {
    data: { bookings: (data as BookingWithDetails[]) ?? [], total: count ?? 0 },
    error: null,
  }
}

export async function getBookingByIdAdmin(
  id: string
): Promise<ApiResponse<BookingWithDetails>> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, venue:venues(*), customer:profiles(*), payments(*)')
    .eq('id', id)
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as BookingWithDetails, error: null }
}

// ============================================================
// Gallery
// ============================================================

export async function getGalleryItems(
  category?: string,
  venueId?: string
): Promise<ApiResponse<DbGallery[]>> {
  const supabase = createSupabaseServerClient()

  let query = supabase
    .from('gallery')
    .select('*')
    .eq('is_active', true)

  if (category) query = query.eq('category', category)
  if (venueId) query = query.eq('venue_id', venueId)

  const { data, error } = await query.order('display_order', { ascending: true })
  if (error) return { data: null, error: error.message }
  return { data: data ?? [], error: null }
}

// ============================================================
// Testimonials
// ============================================================

export async function getTestimonials(): Promise<ApiResponse<DbTestimonial[]>> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) return { data: null, error: error.message }
  return { data: data ?? [], error: null }
}

// ============================================================
// Notifications
// ============================================================

export async function getUserNotifications(
  userId: string
): Promise<ApiResponse<DbNotification[]>> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return { data: null, error: error.message }
  return { data: data ?? [], error: null }
}

// ============================================================
// Admin Dashboard Stats
// ============================================================

export async function getDashboardStats() {
  const supabase = createSupabaseServerClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()
  const todayStr = now.toISOString().split('T')[0]

  const [
    { count: totalBookings },
    { count: confirmedBookings },
    { count: pendingVerification },
    { data: revenueData },
    { data: monthlyData },
    { data: lastMonthData },
    { count: upcomingEvents },
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed')
      .is('deleted_at', null),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_verification')
      .is('deleted_at', null),
    supabase
      .from('bookings')
      .select('total_amount')
      .in('status', ['confirmed', 'completed'])
      .is('deleted_at', null),
    supabase
      .from('bookings')
      .select('total_amount')
      .in('status', ['confirmed', 'completed'])
      .gte('created_at', startOfMonth)
      .is('deleted_at', null),
    supabase
      .from('bookings')
      .select('total_amount')
      .in('status', ['confirmed', 'completed'])
      .gte('created_at', startOfLastMonth)
      .lte('created_at', endOfLastMonth)
      .is('deleted_at', null),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed')
      .gte('event_date', todayStr)
      .is('deleted_at', null),
  ])

  const totalRevenue = (revenueData ?? []).reduce((s, b) => s + (b.total_amount ?? 0), 0)
  const monthlyRevenue = (monthlyData ?? []).reduce((s, b) => s + (b.total_amount ?? 0), 0)
  const lastMonthRevenue = (lastMonthData ?? []).reduce((s, b) => s + (b.total_amount ?? 0), 0)
  const revenueTrend = lastMonthRevenue > 0
    ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0

  return {
    data: {
      totalBookings: totalBookings ?? 0,
      confirmedBookings: confirmedBookings ?? 0,
      pendingVerification: pendingVerification ?? 0,
      totalRevenue,
      monthlyRevenue,
      upcomingEvents: upcomingEvents ?? 0,
      trendsVsLastMonth: { bookings: 0, revenue: revenueTrend },
    },
    error: null,
  }
}
