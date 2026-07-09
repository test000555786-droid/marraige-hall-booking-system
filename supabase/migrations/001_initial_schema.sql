-- ============================================================
-- Marriage Hall Booking System — Initial Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('customer', 'admin', 'owner');
CREATE TYPE booking_status AS ENUM (
  'pending_payment',
  'pending_verification',
  'confirmed',
  'rejected',
  'cancelled',
  'completed',
  'expired'
);
CREATE TYPE payment_method AS ENUM ('upi', 'cash');
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE event_type AS ENUM (
  'wedding',
  'reception',
  'engagement',
  'birthday',
  'corporate',
  'other'
);
CREATE TYPE venue_tier AS ENUM ('simple', 'premium', 'luxurious');
CREATE TYPE notification_type AS ENUM (
  'booking_received',
  'booking_confirmed',
  'booking_rejected',
  'booking_cancelled',
  'booking_expired',
  'payment_received',
  'payment_verified',
  'payment_rejected',
  'reminder',
  'general'
);
CREATE TYPE gallery_category AS ENUM (
  'weddings',
  'receptions',
  'engagements',
  'decor',
  'venue',
  'other'
);

-- ============================================================
-- TABLE 1: hall_settings
-- ============================================================

CREATE TABLE hall_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 2: profiles
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 3: venues
-- ============================================================

CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tier venue_tier NOT NULL DEFAULT 'simple',
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  capacity_min INTEGER NOT NULL DEFAULT 50,
  capacity_max INTEGER NOT NULL,
  price_per_day NUMERIC(12, 2) NOT NULL,
  price_half_day NUMERIC(12, 2),
  amenities TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 4: bookings
-- ============================================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_ref TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES profiles(id),
  venue_id UUID NOT NULL REFERENCES venues(id),
  event_date DATE NOT NULL,
  event_type event_type NOT NULL,
  guest_count INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending_payment',
  base_price NUMERIC(12, 2) NOT NULL,
  advance_amount NUMERIC(12, 2) NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  override_price NUMERIC(12, 2),
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES profiles(id),
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ, -- soft delete
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 5: payments
-- ============================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  method payment_method NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  transaction_id TEXT,
  screenshot_url TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 6: blocked_dates
-- ============================================================

CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id), -- NULL = all venues
  blocked_date DATE NOT NULL,
  reason TEXT,
  blocked_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 7: notifications
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  booking_id UUID REFERENCES bookings(id),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 8: gallery
-- ============================================================

CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  category gallery_category NOT NULL DEFAULT 'other',
  venue_id UUID REFERENCES venues(id),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 9: testimonials
-- ============================================================

CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  event_type event_type NOT NULL,
  event_date DATE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message TEXT NOT NULL,
  avatar_url TEXT,
  venue_id UUID REFERENCES venues(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EMAIL LOG (bonus: prevents email crashes)
-- ============================================================

CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  recipient TEXT NOT NULL,
  template TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | sent | failed
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BOOKING REFERENCE TRIGGER: MH-YYYY-NNNNN
-- ============================================================

CREATE SEQUENCE booking_ref_seq START 1;

CREATE OR REPLACE FUNCTION generate_booking_ref()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_ref := 'MH-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('booking_ref_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_booking_ref
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.booking_ref IS NULL OR NEW.booking_ref = '')
  EXECUTE FUNCTION generate_booking_ref();

-- ============================================================
-- OVERLAP EXCLUSION CONSTRAINT
-- Prevents double-booking same venue on same date
-- ============================================================

CREATE UNIQUE INDEX bookings_venue_date_unique
  ON bookings (venue_id, event_date)
  WHERE deleted_at IS NULL
    AND status NOT IN ('cancelled', 'rejected', 'expired');

-- ============================================================
-- updated_at TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_gallery_updated_at
  BEFORE UPDATE ON gallery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_venue ON bookings(venue_id);
CREATE INDEX idx_bookings_event_date ON bookings(event_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_deleted ON bookings(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_blocked_dates_date ON blocked_dates(blocked_date);
CREATE INDEX idx_gallery_active ON gallery(is_active, display_order);
