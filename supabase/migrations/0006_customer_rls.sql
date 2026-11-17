-- ============================================================
-- cat-bag — customer-scoped RLS policies (Clerk era)
--
-- Defense-in-depth for direct browser reads once Clerk's native
-- Supabase JWT integration forwards session tokens. The app itself
-- also scopes reads server-side through the DAL after verifying the
-- Clerk session, so these policies are a safety net, not the only
-- guard.
-- ============================================================

-- Signed-in customers see their own profile row
CREATE POLICY customer_read_own_profile ON public.customers
  FOR SELECT USING (
    clerk_user_id = auth.jwt() ->> 'sub'
  );

-- Their own addresses
CREATE POLICY customer_read_own_addresses ON public.customer_addresses
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Their own orders
CREATE POLICY customer_read_own_orders ON public.orders
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Order items of their own orders
CREATE POLICY customer_read_own_order_items ON public.order_items
  FOR SELECT USING (
    order_id IN (
      SELECT o.id FROM public.orders o
        JOIN public.customers c ON c.id = o.customer_id
       WHERE c.clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Their own wishlist
CREATE POLICY customer_read_own_wishlist ON public.wishlists
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY customer_read_own_wishlist_items ON public.wishlist_items
  FOR SELECT USING (
    wishlist_id IN (
      SELECT w.id FROM public.wishlists w
        JOIN public.customers c ON c.id = w.customer_id
       WHERE c.clerk_user_id = auth.jwt() ->> 'sub'
    )
  );
