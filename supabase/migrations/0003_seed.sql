-- ============================================================
-- cat-bag — seed data
-- Safe defaults only. No invented contact numbers, policies
-- or delivery promises — the administrator configures those.
-- ============================================================

-- Categories (nav order)
INSERT INTO public.categories (slug, name, description, sort_order, show_in_nav, is_active) VALUES
  ('new-in',            'New In',         'The latest additions to the collection.', 2, false, true),
  ('personalisation',   'Personalisation','Made personal — engraving and monogramming.', 3, false, false),
  ('crossbody-bags',    'Crossbody Bags', 'Hands-free silhouettes for every day.', 4, true, true),
  ('shoulder-bags',     'Shoulder Bags',  'Elegant styles carried on the shoulder.', 5, true, true),
  ('tote-bags',         'Tote Bags',      'Spacious totes for work and beyond.', 6, true, true),
  ('accessories',       'Accessories',    'Small leather and fashion goods.', 7, true, true);

-- 'New In' is driven by products.is_new on the storefront; the category row
-- exists so admins can curate it later. 'Personalisation' stays hidden
-- (show_in_nav=false, is_active=false) until the service is genuinely offered.

-- Store settings (all editable in Admin → Settings / Content)
INSERT INTO public.store_settings (key, value) VALUES
('brand', jsonb_build_object(
   'name', 'Maison Noor',
   'tagline', 'Everyday elegance, carefully chosen',
   'description', 'A curated collection of premium women''s handbags — quiet luxury at a thoughtful price.',
   'logo_path', null
 )),
('contact.whatsapp', jsonb_build_object('number', '', 'message', 'Hello! I have a question about a product.')),
('contact.phone', jsonb_build_object('number', '')),
('contact.email', jsonb_build_object('address', '')),
('social', jsonb_build_object(
   'instagram', '', 'facebook', '', 'tiktok', ''
 )),
('footer', jsonb_build_object(
   'about', 'A curated collection of premium women''s handbags for Bangladesh.',
   'note', ''
 )),
('orders', jsonb_build_object(
   'require_auth', true,
   'delivery_note', 'Delivery charges are shown at checkout based on your district.'
 )),
('announcement', jsonb_build_object(
   'enabled', false,
   'text', ''
 )),
('homepage', jsonb_build_object(
   'sections', jsonb_build_object(
     'hero',       true,
     'categories', true,
     'new_arrivals', true,
     'featured',   true,
     'editorial',  true,
     'discover',   true
   ),
   'hero', jsonb_build_object(
     'heading', 'The Quiet Edit',
     'subheading', 'Considered silhouettes in refined materials — made for everyday elegance.',
     'cta_label', 'Explore the Collection',
     'cta_href', '/shop',
     'image_path', null
   ),
   'editorial', jsonb_build_object(
     'heading', 'Style that stays',
     'body', 'We believe a bag should keep up with a full life — mornings at work, evenings out, everything between. Our collection is selected with intention: timeless shapes, honest materials and details that quietly matter.'
   )
 )),
('features', jsonb_build_object(
   'wishlist', true,
   'personalisation', false
 ));

-- Delivery zones: all 64 districts, charge 0 = not yet configured.
-- The admin sets real charges in Admin → Settings → Delivery.
INSERT INTO public.delivery_zones (district, charge) VALUES
 ('Dhaka',0),('Faridpur',0),('Gazipur',0),('Gopalganj',0),('Jamalpur',0),('Kishoreganj',0),
 ('Madaripur',0),('Manikganj',0),('Munshiganj',0),('Mymensingh',0),('Narayanganj',0),('Narsingdi',0),
 ('Netrakona',0),('Rajbari',0),('Shariatpur',0),('Sherpur',0),('Tangail',0),
 ('Bogura',0),('Joypurhat',0),('Naogaon',0),('Natore',0),('Chapainawabganj',0),('Pabna',0),('Rajshahi',0),('Sirajganj',0),
 ('Dinajpur',0),('Kurigram',0),('Lalmonirhat',0),('Nilphamari',0),('Panchagarh',0),('Rangpur',0),('Thakurgaon',0),
 ('Barguna',0),('Barishal',0),('Bhola',0),('Jhalokathi',0),('Patuakhali',0),('Pirojpur',0),
 ('Bandarban',0),('Brahmanbaria',0),('Chandpur',0),('Chattogram',0),('Cumilla',0),('Cox''s Bazar',0),('Feni',0),('Khagrachhari',0),
 ('Lakshmipur',0),('Noakhali',0),('Rangamati',0),
 ('Habiganj',0),('Moulvibazar',0),('Sunamganj',0),('Sylhet',0),
 ('Bagerhat',0),('Chuadanga',0),('Jashore',0),('Jhenaidah',0),('Kushtia',0),('Magura',0),('Meherpur',0),('Narail',0),
 ('Satkhira',0);
