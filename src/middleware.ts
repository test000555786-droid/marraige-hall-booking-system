import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

// ============================================================
// Route groups
// ============================================================

const CUSTOMER_ROUTES = ['/dashboard', '/bookings', '/profile', '/notifications']
const ADMIN_ROUTES = ['/admin']
const AUTH_ROUTES = ['/login', '/register', '/admin/login']
const BOOKING_ROUTES = ['/book']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // ============================================================
  // Admin route protection
  // ============================================================
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && !pathname.startsWith('/admin/login')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Check admin role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single()

    if (
      !profile ||
      !profile.is_active ||
      !['admin', 'owner'].includes(profile.role)
    ) {
      // Not an admin — redirect to homepage with error
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url))
    }

    return response
  }

  // ============================================================
  // Customer route protection
  // ============================================================
  if (CUSTOMER_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return response
  }

  // ============================================================
  // Booking flow — requires auth (redirect to login then back)
  // ============================================================
  if (BOOKING_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return response
  }

  // ============================================================
  // Redirect logged-in users away from auth pages
  // ============================================================
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (session) {
      // Check role to redirect to correct dashboard
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile && ['admin', 'owner'].includes(profile.role)) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }

      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/bookings/:path*',
    '/profile/:path*',
    '/notifications/:path*',
    '/book/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
}
