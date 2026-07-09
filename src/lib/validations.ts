import { z } from 'zod'

// ============================================================
// Shared field validators
// ============================================================

const indianPhone = z
  .string()
  .min(10, 'Enter a valid Indian phone number')
  .regex(/^(\+91|91)?[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')

const requiredString = (field: string) =>
  z.string().min(1, `${field} is required`)

// ============================================================
// Auth schemas
// ============================================================

export const registerSchema = z
  .object({
    fullName: requiredString('Full name').max(100, 'Name too long'),
    email: z.string().email('Enter a valid email address'),
    phone: indianPhone,
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// ============================================================
// Booking flow schemas
// ============================================================

export const bookingStep1Schema = z.object({
  venueId: requiredString('Venue'),
  eventDate: requiredString('Event date').regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Invalid date format'
  ),
})

export type BookingStep1FormData = z.infer<typeof bookingStep1Schema>

export const bookingStep2Schema = z.object({
  customerName: requiredString('Full name').max(100),
  customerPhone: indianPhone,
  customerEmail: z.string().email('Enter a valid email address'),
  eventType: z.enum(['wedding', 'reception', 'engagement', 'birthday', 'corporate', 'other'], {
    errorMap: () => ({ message: 'Select an event type' }),
  }),
  guestCount: z
    .number({ invalid_type_error: 'Enter expected guest count' })
    .int()
    .min(1, 'Guest count must be at least 1')
    .max(5000, 'Guest count seems too high'),
  notes: z.string().max(500, 'Notes too long').optional(),
})

export type BookingStep2FormData = z.infer<typeof bookingStep2Schema>

export const bookingStep3Schema = z.object({
  agreed: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the cancellation policy' }),
  }),
})

export type BookingStep3FormData = z.infer<typeof bookingStep3Schema>

export const bookingStep4UpiSchema = z.object({
  paymentMethod: z.literal('upi'),
  transactionId: requiredString('Transaction ID').max(100),
  screenshotFile: z
    .instanceof(File, { message: 'Payment screenshot is required' })
    .refine((f) => f.size <= 5 * 1024 * 1024, 'Screenshot must be under 5MB')
    .refine(
      (f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
      'Screenshot must be JPG, PNG or WEBP'
    ),
})

export const bookingStep4CashSchema = z.object({
  paymentMethod: z.literal('cash'),
  transactionId: z.string().optional(),
  screenshotFile: z.undefined().optional(),
})

export const bookingStep4Schema = z.discriminatedUnion('paymentMethod', [
  bookingStep4UpiSchema,
  bookingStep4CashSchema,
])

export type BookingStep4FormData = z.infer<typeof bookingStep4Schema>

// ============================================================
// Contact form
// ============================================================

export const contactSchema = z.object({
  name: requiredString('Name').max(100),
  email: z.string().email('Enter a valid email address'),
  phone: indianPhone.optional().or(z.literal('')),
  subject: requiredString('Subject').max(200),
  message: requiredString('Message').min(10, 'Message too short').max(2000),
})

export type ContactFormData = z.infer<typeof contactSchema>

// ============================================================
// Profile editor
// ============================================================

export const profileSchema = z.object({
  fullName: requiredString('Full name').max(100),
  phone: indianPhone.optional().or(z.literal('')),
})

export type ProfileFormData = z.infer<typeof profileSchema>

// ============================================================
// Admin: Create booking
// ============================================================

export const adminCreateBookingSchema = z.object({
  customerId: requiredString('Customer'),
  venueId: requiredString('Venue'),
  eventDate: requiredString('Event date'),
  eventType: z.enum(['wedding', 'reception', 'engagement', 'birthday', 'corporate', 'other']),
  guestCount: z.number().int().min(1).max(5000),
  customerName: requiredString('Customer name'),
  customerPhone: indianPhone,
  customerEmail: z.string().email(),
  overridePrice: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
  alreadyPaid: z.boolean().default(false),
})

export type AdminCreateBookingFormData = z.infer<typeof adminCreateBookingSchema>

// ============================================================
// Admin: Venue create/edit
// ============================================================

export const venueSchema = z.object({
  name: requiredString('Venue name').max(100),
  slug: requiredString('Slug').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  tier: z.enum(['simple', 'premium', 'luxurious']),
  description: requiredString('Description').min(20),
  shortDescription: requiredString('Short description').max(200),
  capacityMin: z.number().int().min(1),
  capacityMax: z.number().int().min(1),
  pricePerDay: z.number().positive('Price must be positive'),
  priceHalfDay: z.number().positive().optional(),
  amenities: z.array(z.string().min(1)).min(1, 'Add at least one amenity'),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().min(0),
})

export type VenueFormData = z.infer<typeof venueSchema>

// ============================================================
// Admin: Block dates
// ============================================================

export const blockDateSchema = z.object({
  startDate: requiredString('Start date'),
  endDate: z.string().optional(),
  venueId: z.string().optional(), // undefined = all venues
  reason: z.string().max(500).optional(),
})

export type BlockDateFormData = z.infer<typeof blockDateSchema>

// ============================================================
// Admin: Payment verify/reject
// ============================================================

export const rejectPaymentSchema = z.object({
  reason: requiredString('Rejection reason').min(10, 'Please provide a detailed reason'),
})

export type RejectPaymentFormData = z.infer<typeof rejectPaymentSchema>

// ============================================================
// Admin: Hall Settings tabs
// ============================================================

export const hallInfoSchema = z.object({
  hall_name: requiredString('Hall name'),
  hall_tagline: z.string().max(200).optional(),
  hall_phone: requiredString('Phone'),
  hall_phone_alt: z.string().optional(),
  hall_email: z.string().email(),
  hall_address_line1: requiredString('Address'),
  hall_address_line2: z.string().optional(),
  hall_city: requiredString('City'),
  hall_state: requiredString('State'),
  hall_pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
  hall_about: z.string().max(2000).optional(),
})

export type HallInfoFormData = z.infer<typeof hallInfoSchema>

export const bookingRulesSchema = z.object({
  advance_payment_percent: z.number().int().min(1).max(100),
  booking_expiry_hours: z.number().int().min(1).max(168),
  min_advance_days: z.number().int().min(0).max(365),
  max_advance_days: z.number().int().min(1).max(730),
  cancellation_policy: requiredString('Cancellation policy').min(20),
})

export type BookingRulesFormData = z.infer<typeof bookingRulesSchema>

export const paymentSettingsSchema = z.object({
  hall_upi_id: requiredString('UPI ID'),
  hall_upi_name: requiredString('UPI name'),
})

export type PaymentSettingsFormData = z.infer<typeof paymentSettingsSchema>
