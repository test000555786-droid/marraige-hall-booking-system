import { NextResponse } from 'next/server'
import { contactSchema } from '@/lib/validations'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: 'Invalid form data' },
        { status: 400 }
      )
    }

    const { name, email, phone, subject, message } = parsed.data

    // Get admin email from settings
    const supabase = createSupabaseAdminClient()
    const { data: setting } = await supabase
      .from('hall_settings')
      .select('value')
      .eq('key', 'admin_notification_email')
      .single()

    const adminEmail = setting?.value || 'admin@shubhvivahhall.in'

    // Send email via Resend (non-blocking - log failures)
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Shubh Vivah Hall Website <noreply@shubhvivahhall.in>',
          to: adminEmail,
          reply_to: email,
          subject: `Contact Form: ${subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br/>')}</p>
          `,
        }),
      })
      if (!res.ok) console.error('[CONTACT] Email send failed:', await res.text())
    } catch (emailErr) {
      console.error('[CONTACT] Email error:', emailErr)
      // Don't fail the request just because email failed
    }

    return NextResponse.json({ data: { success: true }, error: null })
  } catch (err) {
    console.error('[CONTACT] Error:', err)
    return NextResponse.json(
      { data: null, error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
