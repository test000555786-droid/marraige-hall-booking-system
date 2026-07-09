-- ============================================================
-- Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE hall_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin or owner
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'owner')
    AND is_active = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user is owner
CREATE OR REPLACE FUNCTION is_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'owner'
    AND is_active = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- hall_settings
-- ============================================================

CREATE POLICY "hall_settings_public_read"
  ON hall_settings FOR SELECT
  USING (TRUE); -- public read

CREATE POLICY "hall_settings_admin_write"
  ON hall_settings FOR ALL
  USING (is_admin());

-- ============================================================
-- profiles
-- ============================================================

CREATE POLICY "profiles_own_read"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_own_update"
  ON profiles FOR UPDATE
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL
  USING (is_admin());

-- ============================================================
-- venues
-- ============================================================

CREATE POLICY "venues_public_read"
  ON venues FOR SELECT
  USING (is_active = TRUE OR is_admin());

CREATE POLICY "venues_admin_write"
  ON venues FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "venues_admin_update"
  ON venues FOR UPDATE
  USING (is_admin());

CREATE POLICY "venues_admin_delete"
  ON venues FOR DELETE
  USING (is_admin());

-- ============================================================
-- bookings
-- ============================================================

CREATE POLICY "bookings_customer_read"
  ON bookings FOR SELECT
  USING (
    (customer_id = auth.uid() AND deleted_at IS NULL)
    OR is_admin()
  );

CREATE POLICY "bookings_customer_insert"
  ON bookings FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "bookings_customer_update"
  ON bookings FOR UPDATE
  USING (
    (customer_id = auth.uid() AND status = 'pending_payment')
    OR is_admin()
  );

CREATE POLICY "bookings_admin_all"
  ON bookings FOR ALL
  USING (is_admin());

-- ============================================================
-- payments
-- ============================================================

CREATE POLICY "payments_customer_read"
  ON payments FOR SELECT
  USING (customer_id = auth.uid() OR is_admin());

CREATE POLICY "payments_customer_insert"
  ON payments FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "payments_admin_update"
  ON payments FOR UPDATE
  USING (is_admin());

CREATE POLICY "payments_admin_all"
  ON payments FOR ALL
  USING (is_admin());

-- ============================================================
-- blocked_dates
-- ============================================================

CREATE POLICY "blocked_dates_public_read"
  ON blocked_dates FOR SELECT
  USING (TRUE);

CREATE POLICY "blocked_dates_admin_write"
  ON blocked_dates FOR ALL
  USING (is_admin());

-- ============================================================
-- notifications
-- ============================================================

CREATE POLICY "notifications_own_read"
  ON notifications FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "notifications_own_update"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "notifications_admin_insert"
  ON notifications FOR INSERT
  WITH CHECK (is_admin() OR TRUE); -- service role inserts on behalf

CREATE POLICY "notifications_admin_all"
  ON notifications FOR ALL
  USING (is_admin());

-- ============================================================
-- gallery
-- ============================================================

CREATE POLICY "gallery_public_read"
  ON gallery FOR SELECT
  USING (is_active = TRUE OR is_admin());

CREATE POLICY "gallery_admin_write"
  ON gallery FOR ALL
  USING (is_admin());

-- ============================================================
-- testimonials
-- ============================================================

CREATE POLICY "testimonials_public_read"
  ON testimonials FOR SELECT
  USING (is_active = TRUE OR is_admin());

CREATE POLICY "testimonials_admin_write"
  ON testimonials FOR ALL
  USING (is_admin());

-- ============================================================
-- email_logs
-- ============================================================

CREATE POLICY "email_logs_admin_read"
  ON email_logs FOR SELECT
  USING (is_admin());

CREATE POLICY "email_logs_service_insert"
  ON email_logs FOR INSERT
  WITH CHECK (TRUE); -- service role only
