import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/notifications'

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json()
    if (!email || !name) return NextResponse.json({ data: null, error: 'Missing fields' }, { status: 400 })
    await sendWelcomeEmail(email, name)
    return NextResponse.json({ data: { success: true }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed' }, { status: 500 })
  }
}
