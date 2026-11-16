-- ============================================================
-- cat-bag — Row Level Security
--
-- Model: browser (anon key) can READ the public catalog only.
-- All writes and all access to customers / orders / admin data
-- go through server-side code using the service-role key inside
-- a centralised Data Access Layer that enforces authorization.
--
-- When Clerk is integrated, customer-scoped read policies
-- (orders "own rows", wishlist, addresses) will be added using
-- the Clerk session claims -> customers.clerk_user_id mapping.
-- ============================================================

ALTER TABLE public.categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements      ENABLE ROW LEVEL SECURITY;

-- Public catalog reads
CREATE POLICY public_read_categories ON public.categories
  FOR SELECT USING (is_active = true);

CREATE POLICY public_read_products ON public.products
  FOR SELECT USING (status = 'active');

CREATE POLICY public_read_product_images ON public.product_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'active')
  );

CREATE POLICY public_read_product_variants ON public.product_variants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'active')
  );

CREATE POLICY public_read_product_categories ON public.product_categories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'active')
  );

-- Public settings reads (brand, contact, footer, announcement — non-sensitive).
-- Sensitive values are never stored in store_settings.
CREATE POLICY public_read_settings ON public.store_settings
  FOR SELECT USING (true);

CREATE POLICY public_read_delivery_zones ON public.delivery_zones
  FOR SELECT USING (is_active = true);

CREATE POLICY public_read_announcements ON public.announcements
  FOR SELECT USING (is_active = true);

-- NOTE (intentional): customers, customer_addresses, wishlists,
-- wishlist_items, orders, order_items, order_status_history,
-- admin_users, admin_activity_logs and inventory_movements have
-- NO public policies. They are accessible only via the
-- service-role key on the server (Data Access Layer).
