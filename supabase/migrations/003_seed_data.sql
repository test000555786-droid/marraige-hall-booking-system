-- ============================================================
-- Seed Data
-- Migration: 003_seed_data.sql
-- ============================================================

-- ============================================================
-- hall_settings
-- ============================================================

INSERT INTO hall_settings (key, value, description) VALUES
  ('hall_name',           'Shubh Vivah Marriage Hall',      'Name of the marriage hall'),
  ('hall_tagline',        'Where Every Celebration Becomes a Memory', 'Tagline shown in hero'),
  ('hall_phone',          '+91 98765 43210',                 'Primary contact number'),
  ('hall_phone_alt',      '+91 91234 56789',                 'Alternate contact number'),
  ('hall_email',          'info@shubhvivahhall.in',          'Contact email address'),
  ('hall_address_line1',  '123, Celebration Avenue',         'Address line 1'),
  ('hall_address_line2',  'Near City Mall, Banjara Hills',   'Address line 2'),
  ('hall_city',           'Hyderabad',                       'City'),
  ('hall_state',          'Telangana',                       'State'),
  ('hall_pincode',        '500034',                          'PIN code'),
  ('hall_google_maps_url','https://maps.google.com/?q=Hyderabad', 'Google Maps embed URL'),
  ('hall_upi_id',         'shubhvivahhall@upi',             'UPI payment ID'),
  ('hall_upi_name',       'Shubh Vivah Hall',                'UPI display name'),
  ('hall_upi_qr_url',     '',                                'UPI QR code image URL (upload in settings)'),
  ('hall_about',          'Shubh Vivah Marriage Hall has been the premier venue for celebrations in Hyderabad for over two decades. With three beautifully appointed halls, we have hosted thousands of weddings, receptions, and special events, creating memories that last a lifetime.', 'About us text'),
  ('hall_established_year','2002',                           'Year hall was established'),
  ('hall_events_count',   '5000+',                           'Total events hosted'),
  ('hall_years_experience','22+',                            'Years of experience'),

  -- Booking rules
  ('advance_payment_percent', '30',    'Advance payment percentage required'),
  ('booking_expiry_hours',    '24',    'Hours before pending booking expires'),
  ('min_advance_days',        '7',     'Minimum days in advance for booking'),
  ('max_advance_days',        '365',   'Maximum days in advance for booking'),
  ('cancellation_policy',     'Cancellations made 30 or more days before the event date will receive a full refund of the advance payment. Cancellations between 15–29 days will receive a 50% refund. No refund for cancellations within 14 days of the event.', 'Cancellation policy text'),

  -- Social links
  ('social_facebook',   'https://facebook.com/shubhvivahhall',   'Facebook page URL'),
  ('social_instagram',  'https://instagram.com/shubhvivahhall',  'Instagram profile URL'),
  ('social_whatsapp',   '+919876543210',                          'WhatsApp number'),

  -- Notification emails
  ('admin_notification_email', 'admin@shubhvivahhall.in', 'Email for admin notifications')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- venues
-- ============================================================

INSERT INTO venues (name, slug, tier, description, short_description, capacity_min, capacity_max, price_per_day, price_half_day, amenities, display_order) VALUES
(
  'Pearl Hall',
  'pearl-hall',
  'simple',
  'Pearl Hall is our elegant entry-level venue, perfect for intimate celebrations. Featuring classic décor with modern amenities, it offers a warm and welcoming atmosphere for gatherings of up to 300 guests. The hall is equipped with a spacious stage, comfortable seating, and basic catering facilities.',
  'Elegant and affordable — perfect for intimate gatherings up to 300 guests.',
  50, 300,
  45000.00,
  25000.00,
  ARRAY['AC Hall', 'Stage with Lighting', 'Basic Sound System', 'Parking (50 cars)', 'Changing Room', 'Backup Generator', 'Basic Catering Kitchen', 'Restrooms'],
  1
),
(
  'Emerald Hall',
  'emerald-hall',
  'premium',
  'Emerald Hall strikes the perfect balance between grandeur and affordability. With its soaring ceilings, crystal chandeliers, and premium décor, it creates a stunning backdrop for mid-size celebrations. The hall accommodates up to 600 guests and features a full-service catering kitchen, professional sound and lighting systems, and dedicated bridal suites.',
  'Stunning chandeliers and premium décor for celebrations up to 600 guests.',
  100, 600,
  85000.00,
  50000.00,
  ARRAY['Fully AC Hall', 'Crystal Chandeliers', 'Professional Sound System', 'LED Stage Lighting', 'Parking (150 cars)', 'Bridal Suite', 'Groom Suite', 'Full Catering Kitchen', 'VIP Lounge', 'Backup Generator', 'Valet Parking', 'Restrooms (6 sets)'],
  2
),
(
  'Diamond Ballroom',
  'diamond-ballroom',
  'luxurious',
  'The Diamond Ballroom is the crown jewel of Shubh Vivah Marriage Hall — a breathtaking 15,000 sq. ft. venue designed for the most lavish celebrations. With imported marble flooring, bespoke chandeliers, a dedicated DJ console, professional-grade catering infrastructure, and capacity for up to 1200 guests, the Diamond Ballroom transforms every event into an unforgettable spectacle.',
  'Our flagship 15,000 sq. ft. ballroom — for celebrations that deserve nothing but the best.',
  200, 1200,
  175000.00,
  100000.00,
  ARRAY['Fully AC Grand Ballroom', 'Imported Marble Flooring', 'Bespoke Chandeliers', 'Professional DJ Console', 'Stage with LED Wall', 'Dolby Sound System', 'Parking (400 cars)', 'Royal Bridal Suite', 'Groom Suite', 'VIP Lounges (2)', 'Full Commercial Kitchen', 'Cocktail Terrace', 'Valet Parking', '24/7 Security', 'Backup Generators (2)', 'Flower Decoration Service', 'Catering Coordination'],
  3
);

-- ============================================================
-- gallery
-- ============================================================

INSERT INTO gallery (url, thumbnail_url, caption, category, display_order) VALUES
('https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1920', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400', 'Grand Wedding Ceremony', 'weddings', 1),
('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400', 'Elegant Reception Decor', 'receptions', 2),
('https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1920', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400', 'Floral Stage Decoration', 'decor', 3),
('https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1920', 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=400', 'Diamond Ballroom Setup', 'venue', 4),
('https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=1920', 'https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=400', 'Engagement Ceremony', 'engagements', 5),
('https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=1920', 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=400', 'Wedding Feast', 'weddings', 6),
('https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1920', 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400', 'Pearl Hall Interior', 'venue', 7),
('https://images.unsplash.com/photo-1501139083538-0139583c060f?w=1920', 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=400', 'Bridal Entry', 'weddings', 8);

-- ============================================================
-- testimonials
-- ============================================================

INSERT INTO testimonials (customer_name, event_type, event_date, rating, message, display_order) VALUES
('Priya & Arjun Sharma', 'wedding', '2024-02-14', 5, 'Our wedding at Diamond Ballroom was absolutely magical. Every detail was perfect — from the stunning décor to the impeccable service. The staff went above and beyond to make our day special. We could not have asked for a better venue!', 1),
('Meera & Karthik Reddy', 'reception', '2024-03-08', 5, 'The Emerald Hall was the perfect setting for our reception. The crystal chandeliers created the most beautiful ambiance. Our guests are still talking about how grand everything was. Highly recommend Shubh Vivah for any special occasion!', 2),
('Sunita Patel', 'engagement', '2024-04-20', 5, 'We booked the Pearl Hall for our daughter''s engagement ceremony and it exceeded all expectations. The team was professional, responsive, and truly caring. The hall looked stunning and the entire event was seamless.', 3),
('Rahul & Divya Nair', 'wedding', '2023-11-15', 5, 'From the moment we first visited to the last dance at our reception, Shubh Vivah delivered excellence at every step. The Diamond Ballroom is truly world-class. Thank you for making our dream wedding a reality!', 4),
('Anjali Mehta', 'birthday', '2024-01-05', 4, 'Booked the Emerald Hall for my mother''s 60th birthday celebration. The experience was fantastic — easy booking process, helpful staff, and a beautiful venue. Will definitely book again for future events!', 5);
