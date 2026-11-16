-- ============================================================
-- cat-bag — initial schema
-- Premium women's handbag e-commerce (Bangladesh)
-- ============================================================

-- Drop legacy tables left over from the previous project (verified empty)
DROP TABLE IF EXISTS public.meeting_requests;
DROP TABLE IF EXISTS public.orders;

-- ---------- Enums ----------
CREATE TYPE public.order_status    AS ENUM ('pending_review','confirmed','processing','dispatched','delivered','cancelled');
CREATE TYPE public.product_status  AS ENUM ('draft','active','inactive','archived');
CREATE TYPE public.admin_role      AS ENUM ('owner','administrator','order_manager','catalog_manager','content_manager');
CREATE TYPE public.inventory_reason AS ENUM ('initial','restock','sale','cancellation','adjustment');

-- ---------- updated_at helper ----------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

-- ---------- Catalog ----------
CREATE TABLE public.categories (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,
  name         text NOT NULL,
  description  text,
  image_path   text,
  sort_order   integer NOT NULL DEFAULT 0,
  show_in_nav  boolean NOT NULL DEFAULT true,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text UNIQUE NOT NULL,
  name           text NOT NULL,
  description    text,
  sku            text UNIQUE NOT NULL,
  price          numeric(12,2) NOT NULL CHECK (price >= 0),
  sale_price     numeric(12,2) CHECK (sale_price IS NULL OR (sale_price > 0 AND sale_price < price)),
  material       text,
  dim_l_cm       numeric(6,1),
  dim_w_cm       numeric(6,1),
  dim_h_cm       numeric(6,1),
  is_new         boolean NOT NULL DEFAULT false,
  is_featured    boolean NOT NULL DEFAULT false,
  status         public.product_status NOT NULL DEFAULT 'draft',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.product_images (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  alt          text,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.product_variants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  colour_name text NOT NULL,
  colour_hex  text NOT NULL DEFAULT '#1A1512',
  sku         text UNIQUE NOT NULL,
  stock       integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.product_categories (
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- ---------- Delivery ----------
CREATE TABLE public.delivery_zones (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district  text UNIQUE NOT NULL,
  charge    numeric(10,2) NOT NULL DEFAULT 0,
  eta_note  text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- Customers ----------
CREATE TABLE public.customers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text UNIQUE,          -- populated when Clerk is integrated
  full_name     text,
  phone         text,
  email         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.customer_addresses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  label         text,
  receiver_name text NOT NULL,
  phone         text NOT NULL,
  address_line  text NOT NULL,
  district      text NOT NULL,
  area          text,
  instructions  text,
  is_default    boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.wishlists (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL UNIQUE REFERENCES public.customers(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.wishlist_items (
  wishlist_id uuid NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  added_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (wishlist_id, product_id)
);

-- ---------- Orders ----------
CREATE TABLE public.orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference       text UNIQUE NOT NULL,
  customer_id     uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name   text NOT NULL,
  customer_phone  text NOT NULL,
  address_line    text NOT NULL,
  district        text NOT NULL,
  area            text,
  instructions    text,
  subtotal        numeric(12,2) NOT NULL,
  delivery_charge numeric(10,2) NOT NULL DEFAULT 0,
  total           numeric(12,2) NOT NULL,
  status          public.order_status NOT NULL DEFAULT 'pending_review',
  idempotency_key text UNIQUE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  product_id   uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id   uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name text NOT NULL,           -- snapshot: survives product edits
  variant_name text,
  sku          text NOT NULL,
  unit_price   numeric(12,2) NOT NULL,
  quantity     integer NOT NULL CHECK (quantity > 0),
  line_total   numeric(12,2) NOT NULL
);

CREATE TABLE public.order_status_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status public.order_status,
  to_status   public.order_status NOT NULL,
  note        text,
  changed_by  uuid,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- Admin ----------
CREATE TABLE public.admin_users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  name          text NOT NULL,
  role          public.admin_role NOT NULL DEFAULT 'order_manager',
  clerk_user_id text UNIQUE,           -- optional: Clerk-based admin login later
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

ALTER TABLE public.order_status_history
  ADD CONSTRAINT osh_changed_by_fkey
  FOREIGN KEY (changed_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;

CREATE TABLE public.admin_activity_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
  action        text NOT NULL,
  entity_type   text,
  entity_id     uuid,
  details       jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.inventory_movements (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id   uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  delta        integer NOT NULL,
  stock_after  integer NOT NULL,
  reason       public.inventory_reason NOT NULL,
  order_id     uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  admin_user_id uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ---------- Settings / CMS ----------
CREATE TABLE public.store_settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.admin_users(id) ON DELETE SET NULL
);

CREATE TABLE public.announcements (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text       text NOT NULL,
  link_url   text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active  boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- Indexes ----------
CREATE INDEX idx_products_status      ON public.products(status);
CREATE INDEX idx_products_featured    ON public.products(is_featured) WHERE is_featured;
CREATE INDEX idx_products_new         ON public.products(is_new) WHERE is_new;
CREATE INDEX idx_products_created     ON public.products(created_at DESC);
CREATE INDEX idx_images_product       ON public.product_images(product_id, sort_order);
CREATE INDEX idx_variants_product     ON public.product_variants(product_id);
CREATE INDEX idx_pc_category          ON public.product_categories(category_id);
CREATE INDEX idx_orders_status        ON public.orders(status);
CREATE INDEX idx_orders_created       ON public.orders(created_at DESC);
CREATE INDEX idx_orders_customer      ON public.orders(customer_id);
CREATE INDEX idx_order_items_order    ON public.order_items(order_id);
CREATE INDEX idx_osh_order            ON public.order_status_history(order_id, created_at);
CREATE INDEX idx_inv_product          ON public.inventory_movements(product_id, created_at DESC);
CREATE INDEX idx_activity_created     ON public.admin_activity_logs(created_at DESC);
CREATE INDEX idx_categories_sort      ON public.categories(sort_order);
CREATE INDEX idx_addresses_customer   ON public.customer_addresses(customer_id);

-- ---------- Triggers ----------
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_variants_updated BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_delivery_updated BEFORE UPDATE ON public.delivery_zones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_addresses_updated BEFORE UPDATE ON public.customer_addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- Order reference generator ----------
CREATE OR REPLACE FUNCTION public.generate_order_reference()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  ref text;
BEGIN
  LOOP
    ref := 'CB-' || to_char(now(),'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.orders WHERE reference = ref);
  END LOOP;
  RETURN ref;
END $$;
