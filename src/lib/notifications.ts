import { createSupabaseAdminClient } from '@/lib/supabase/server'
import type { BookingWithDetails, NotificationType } from '@/types/database'

// ============================================================
// Notification creation (DB)
// ============================================================

export async function createNotification({
  userId,
  type,
  title,
  message,
  bookingId,
}: {
  userId: string
  type: NotificationType
  title: string
  message: string
  bookingId?: string
}): Promise<void> {
  const supabase = createSupabaseAdminClient()
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    booking_id: bookingId ?? null,
  })
}

// ============================================================
// Email logging
// ============================================================

async function logEmail({
  bookingId,
  recipient,
  template,
  subject,
  status,
  errorMessage,
}: {
  bookingId?: string
  recipient: string
  template: string
  subject: string
  status: 'sent' | 'failed'
  errorMessage?: string
}): Promise<void> {
  const supabase = createSupabaseAdminClient()
  await supabase.from('email_logs').insert({
    booking_id: bookingId ?? null,
    recipient,
    template,
    subject,
    status,
    error_message: errorMessage ?? null,
    sent_at: status === 'sent' ? new Date().toISOString() : null,
  })
}

// ============================================================
// Email sending via Resend
// ============================================================

async function sendEmail({
  to,
  subject,
  html,
  template,
  bookingId,
}: {
  to: string
  subject: string
  html: string
  template: string
  bookingId?: string
}): Promise<void> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Shubh Vivah Hall <noreply@shubhvivahhall.in>',
        to,
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    await logEmail({ bookingId, recipient: to, template, subject, status: 'sent' })
  } catch (err) {
    // Email failures must NEVER crash main operations
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[EMAIL] Failed to send ${template} to ${to}:`, errorMessage)
    await logEmail({
      bookingId,
      recipient: to,
      template,
      subject,
      status: 'failed',
      errorMessage,
    })
  }
}

// ============================================================
// Email templates
// ============================================================

function emailWrapper(content: string, hallName = 'Shubh Vivah Marriage Hall'): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${hallName}</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:#1A1A2E;padding:28px 32px;text-align:center;">
          <h1 style="margin:0;color:#C9A84C;font-size:24px;font-family:Georgia,serif;">${hallName}</h1>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#F5F0E8;padding:20px 32px;text-align:center;border-top:1px solid #e5e0d8;">
          <p style="margin:0;color:#888;font-size:12px;">© ${new Date().getFullYear()} ${hallName}. All rights reserved.</p>
          <p style="margin:4px 0 0;color:#888;font-size:12px;">This is an automated email. Please do not reply.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function bookingInfoBlock(booking: BookingWithDetails): string {
  return `
    <table width="100%" cellpadding="8" cellspacing="0" style="background:#F5F0E8;border-radius:8px;margin:16px 0;">
      <tr><td style="color:#666;font-size:13px;">Booking Reference</td><td style="font-weight:bold;color:#1A1A2E;">${booking.booking_ref}</td></tr>
      <tr><td style="color:#666;font-size:13px;">Venue</td><td style="color:#1A1A2E;">${booking.venue?.name ?? '—'}</td></tr>
      <tr><td style="color:#666;font-size:13px;">Event Date</td><td style="color:#1A1A2E;">${booking.event_date}</td></tr>
      <tr><td style="color:#666;font-size:13px;">Event Type</td><td style="color:#1A1A2E;">${booking.event_type}</td></tr>
      <tr><td style="color:#666;font-size:13px;">Guests</td><td style="color:#1A1A2E;">${booking.guest_count}</td></tr>
      <tr><td style="color:#666;font-size:13px;">Advance Amount</td><td style="font-weight:bold;color:#C9A84C;">₹${booking.advance_amount.toLocaleString('en-IN')}</td></tr>
    </table>`
}

// ============================================================
// Exported email senders
// ============================================================

export async function sendBookingReceivedEmail(booking: BookingWithDetails): Promise<void> {
  const subject = `Booking Received — ${booking.booking_ref} | Shubh Vivah Hall`
  const html = emailWrapper(`
    <h2 style="color:#1A1A2E;margin:0 0 8px;">Booking Received! 🎉</h2>
    <p style="color:#555;margin:0 0 16px;">Dear ${booking.customer_name},</p>
    <p style="color:#555;">Thank you for choosing Shubh Vivah Marriage Hall. We have received your booking request. Please complete your advance payment to confirm the booking.</p>
    ${bookingInfoBlock(booking)}
    <p style="color:#555;margin:16px 0 4px;font-weight:bold;">Next Steps:</p>
    <ol style="color:#555;margin:0;padding-left:20px;">
      <li>Pay the advance amount of <strong>₹${booking.advance_amount.toLocaleString('en-IN')}</strong> via UPI or Cash</li>
      <li>Upload your payment screenshot in your dashboard</li>
      <li>Our team will verify and confirm your booking within 24 hours</li>
    </ol>
    <p style="color:#888;font-size:13px;margin:20px 0 0;">If you have any questions, call us or reply to this email.</p>
  `)
  await sendEmail({ to: booking.customer_email, subject, html, template: 'booking_received', bookingId: booking.id })
}

export async function sendBookingConfirmedEmail(booking: BookingWithDetails): Promise<void> {
  const subject = `Booking Confirmed ✅ — ${booking.booking_ref} | Shubh Vivah Hall`
  const html = emailWrapper(`
    <h2 style="color:#16a34a;margin:0 0 8px;">Booking Confirmed! ✅</h2>
    <p style="color:#555;margin:0 0 16px;">Dear ${booking.customer_name},</p>
    <p style="color:#555;">Great news! Your payment has been verified and your booking is confirmed. We look forward to making your event unforgettable!</p>
    ${bookingInfoBlock(booking)}
    <p style="color:#555;margin:16px 0;">Please keep your booking reference <strong>${booking.booking_ref}</strong> handy for future communications.</p>
  `)
  await sendEmail({ to: booking.customer_email, subject, html, template: 'booking_confirmed', bookingId: booking.id })
}

export async function sendPaymentRejectedEmail(booking: BookingWithDetails, reason: string): Promise<void> {
  const subject = `Payment Not Verified — ${booking.booking_ref} | Shubh Vivah Hall`
  const html = emailWrapper(`
    <h2 style="color:#dc2626;margin:0 0 8px;">Payment Not Verified</h2>
    <p style="color:#555;margin:0 0 16px;">Dear ${booking.customer_name},</p>
    <p style="color:#555;">Unfortunately, we were unable to verify your payment for the following reason:</p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0;color:#dc2626;">${reason}</p>
    </div>
    ${bookingInfoBlock(booking)}
    <p style="color:#555;">Please re-submit your payment details through your dashboard. If you believe this is an error, please contact us immediately.</p>
  `)
  await sendEmail({ to: booking.customer_email, subject, html, template: 'payment_rejected', bookingId: booking.id })
}

export async function sendBookingCancelledEmail(booking: BookingWithDetails): Promise<void> {
  const subject = `Booking Cancelled — ${booking.booking_ref} | Shubh Vivah Hall`
  const html = emailWrapper(`
    <h2 style="color:#dc2626;margin:0 0 8px;">Booking Cancelled</h2>
    <p style="color:#555;margin:0 0 16px;">Dear ${booking.customer_name},</p>
    <p style="color:#555;">Your booking has been cancelled. We are sorry to hear that your plans have changed.</p>
    ${bookingInfoBlock(booking)}
    ${booking.cancellation_reason ? `<p style="color:#555;"><strong>Reason:</strong> ${booking.cancellation_reason}</p>` : ''}
    <p style="color:#555;">For refund queries, please contact us. We hope to serve you in the future!</p>
  `)
  await sendEmail({ to: booking.customer_email, subject, html, template: 'booking_cancelled', bookingId: booking.id })
}

export async function sendBookingExpiredEmail(booking: BookingWithDetails): Promise<void> {
  const subject = `Booking Expired — ${booking.booking_ref} | Shubh Vivah Hall`
  const html = emailWrapper(`
    <h2 style="color:#ea580c;margin:0 0 8px;">Booking Expired ⏰</h2>
    <p style="color:#555;margin:0 0 16px;">Dear ${booking.customer_name},</p>
    <p style="color:#555;">Your booking has expired because no payment was received within the required timeframe.</p>
    ${bookingInfoBlock(booking)}
    <p style="color:#555;">If you still wish to book the venue, please create a new booking. We apologise for any inconvenience.</p>
  `)
  await sendEmail({ to: booking.customer_email, subject, html, template: 'booking_expired', bookingId: booking.id })
}

export async function sendBookingReminderEmail(booking: BookingWithDetails, daysUntilEvent: number): Promise<void> {
  const subject = `Reminder: Your event is in ${daysUntilEvent} days — ${booking.booking_ref}`
  const html = emailWrapper(`
    <h2 style="color:#1A1A2E;margin:0 0 8px;">Event Reminder 🔔</h2>
    <p style="color:#555;margin:0 0 16px;">Dear ${booking.customer_name},</p>
    <p style="color:#555;">This is a friendly reminder that your event at Shubh Vivah Marriage Hall is <strong>${daysUntilEvent} days</strong> away!</p>
    ${bookingInfoBlock(booking)}
    <p style="color:#555;">If you have any special requirements or questions, please contact us at least 3 days before the event.</p>
  `)
  await sendEmail({ to: booking.customer_email, subject, html, template: 'reminder', bookingId: booking.id })
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const subject = 'Welcome to Shubh Vivah Marriage Hall!'
  const html = emailWrapper(`
    <h2 style="color:#1A1A2E;margin:0 0 8px;">Welcome, ${name}! 🎉</h2>
    <p style="color:#555;">Thank you for registering with Shubh Vivah Marriage Hall. Your account is ready.</p>
    <p style="color:#555;">You can now browse our beautiful venues, check availability, and make bookings directly from your dashboard.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/venues" style="background:#C9A84C;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Explore Venues</a>
    </div>
  `)
  await sendEmail({ to: email, subject, html, template: 'welcome' })
}

export async function sendAdminNewBookingEmail(
  booking: BookingWithDetails,
  adminEmail: string
): Promise<void> {
  const subject = `New Booking — ${booking.booking_ref} | ${booking.customer_name}`
  const html = emailWrapper(`
    <h2 style="color:#1A1A2E;margin:0 0 8px;">New Booking Received 📋</h2>
    <p style="color:#555;margin:0 0 16px;">A new booking has been submitted and requires your attention.</p>
    ${bookingInfoBlock(booking)}
    <p style="color:#555;"><strong>Customer:</strong> ${booking.customer_name} | ${booking.customer_phone}</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings/${booking.id}" style="background:#1A1A2E;color:#C9A84C;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">View in Admin</a>
    </div>
  `)
  await sendEmail({ to: adminEmail, subject, html, template: 'admin_new_booking', bookingId: booking.id })
}
