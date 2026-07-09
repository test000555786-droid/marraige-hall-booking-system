# Shubh Vivah Marriage Hall Booking System

A production-grade, full-stack marriage hall booking system built with Next.js 14, Supabase, Tailwind CSS, and TypeScript.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router, TypeScript strict), Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State**: Zustand (booking flow + notifications)
- **Forms**: React Hook Form + Zod
- **Email**: Resend
- **Charts**: Recharts
- **Deployment**: Vercel

---

## Quick Start

### 1. Create Next.js App

```bash
npx create-next-app@14 marriage-hall --typescript --tailwind --app --src-dir
cd marriage-hall
```

### 2. Install Dependencies

```bash
npm install @hookform/resolvers @radix-ui/react-accordion @radix-ui/react-alert-dialog \
  @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover \
  @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area \
  @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot \
  @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip \
  @supabase/ssr @supabase/supabase-js class-variance-authority clsx date-fns date-fns-tz \
  lucide-react react-day-picker react-hook-form recharts resend sonner \
  tailwind-merge tailwindcss-animate zod zustand
```

### 3. Copy Files

Copy all files from this archive into your project, preserving the directory structure.

### 4. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run migrations **in order**:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_seed_data.sql`
3. Create Storage buckets:
   - `payment-screenshots` (private)
   - `gallery` (public)

### 5. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your_resend_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your-random-secret-string
```

### 6. Create Admin User

1. Register at `/register` normally
2. In Supabase SQL Editor, run:
```sql
UPDATE profiles SET role = 'owner' WHERE email = 'your@email.com';
```

### 7. Run

```bash
npm run dev
```

---

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public website (Home, About, Venues, Gallery, etc.)
│   ├── (auth)/            # Login, Register
│   ├── (customer)/        # Dashboard, Bookings, Profile, Notifications
│   ├── admin/             # Admin panel (Dashboard, Bookings, Payments, etc.)
│   └── api/               # API routes
├── components/
│   ├── admin/             # Admin-specific components
│   ├── booking/           # 4-step booking wizard
│   ├── customer/          # Customer dashboard components
│   ├── layout/            # Header, Footer
│   ├── public/            # Public-facing components
│   ├── shared/            # Shared utilities (Skeletons)
│   └── ui/                # Base UI components (Button, Dialog, etc.)
├── lib/
│   ├── supabase/          # Supabase clients (server + browser)
│   ├── notifications.ts   # Email (Resend) + DB notifications
│   ├── queries.ts         # Server-side data fetching
│   ├── utils.ts           # Utilities (IST, INR, formatting)
│   └── validations.ts     # Zod schemas
├── store/
│   ├── bookingStore.ts    # Zustand booking state (sessionStorage)
│   └── notificationStore.ts
├── types/
│   ├── database.ts        # App-level TypeScript types
│   └── supabase.ts        # Generated Supabase types
└── middleware.ts           # Route protection
supabase/
└── migrations/            # SQL migrations (run in order)
```

---

## Features

### Public Website
- Hero with availability checker
- Venue listing with comparison table
- Gallery with lightbox + category filters
- Testimonials carousel
- Availability calendar (green/red/grey per venue)
- Contact form
- SEO: generateMetadata, sitemap.xml, robots.txt

### Booking Flow (4 Steps)
- Step 1: Venue selection + date picker with live conflict check
- Step 2: Customer details (name, phone, email, event type, guests)
- Step 3: Summary + pricing breakdown + cancellation policy
- Step 4: UPI (QR + screenshot upload) or Cash
- Race condition protection (DB unique constraint + pre-check)
- Session recovery (Zustand sessionStorage persistence)

### Customer Area
- Dashboard with stats
- Booking list with filters
- Booking detail with 3 tabs (Details, Payment, Timeline)
- Payment resubmission
- Notifications centre
- Profile editor

### Admin Panel
- Dashboard with 6 stat cards + recharts (bar + line)
- Supabase Realtime: instant toast on new bookings/payments
- Bookings: filters, search, CSV export, realtime updates
- Payment verification with 10-second undo
- Screenshot viewer with full-size modal
- Calendar: month view, block dates (single/range/all/specific venue)
- Venues management
- Gallery: bulk upload, caption edit, delete
- Settings: Hall info, Booking rules, Payment (5 tabs)
- Reports: Revenue charts, top customers, CSV export

### Infrastructure
- Cron job (`/api/cron/expire-bookings`) runs hourly via Vercel Crons
- All 8 email templates (Resend): received, confirmed, rejected, cancelled, expired, reminder, welcome, admin notification
- Email failures logged to `email_logs` table — never crash main operation
- Soft delete on bookings
- IST timezone throughout
- Indian Rupee (₹) formatting

---

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Add all env vars in Vercel project settings
4. Deploy — cron job runs automatically from `vercel.json`

---

## Design System

| Token | Value |
|-------|-------|
| Gold | `#C9A84C` |
| Navy | `#1A1A2E` |
| Cream | `#F5F0E8` |
| Heading font | Playfair Display |
| Body font | Inter |

---

## Database Schema

9 tables: `profiles`, `venues`, `bookings`, `payments`, `blocked_dates`, `notifications`, `gallery`, `testimonials`, `hall_settings` + `email_logs`

Key constraints:
- `bookings_venue_date_unique` — prevents double-booking (partial index, excludes cancelled/rejected/expired)
- `booking_ref` trigger — auto-generates `MH-YYYY-NNNNN`
- Full RLS on every table
- Auto-create profile on Supabase auth signup

---

## Notes

- All hall information (name, phone, UPI, address) comes from `hall_settings` DB table — no hardcoded values
- Admin routes are protected at both middleware and API level
- Zero `any` types — strict TypeScript throughout
- All forms use Zod validation
- All API responses return `{ data, error }`
