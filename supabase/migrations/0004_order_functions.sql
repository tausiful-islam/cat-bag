-- ============================================================
-- cat-bag — atomic order operations (service-role only)
-- All order mutations execute inside PostgreSQL transactions
-- so prices, stock and totals can never desynchronize.
-- Expected payload (jsonb):
--   { customer_id, customer_name, customer_phone, address_line,
--     district, area, instructions,
--     items: [{ variant_id, quantity }],
--     idempotency_key }
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.generate_order_reference() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_order(p jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id     uuid;
  v_reference    text;
  v_existing     jsonb;
  v_subtotal     numeric(12,2) := 0;
  v_charge       numeric(10,2);
  v_item         jsonb;
  v_variant      record;
  v_qty          int;
  v_unit_price   numeric(12,2);
  v_line_total   numeric(12,2);
BEGIN
  -- Idempotency: same key returns the original order
  IF p->>'idempotency_key' IS NOT NULL AND p->>'idempotency_key' <> '' THEN
    SELECT jsonb_build_object('reference', o.reference, 'order_id', o.id, 'duplicate', true)
      INTO v_existing
      FROM public.orders o
     WHERE o.idempotency_key = p->>'idempotency_key';
    IF v_existing IS NOT NULL THEN
      RETURN v_existing;
    END IF;
  END IF;

  IF p->'items' IS NULL OR jsonb_array_length(p->'items') = 0 THEN
    RAISE EXCEPTION 'ORDER_EMPTY';
  END IF;
  IF jsonb_array_length(p->'items') > 40 THEN
    RAISE EXCEPTION 'ORDER_TOO_MANY_ITEMS';
  END IF;

  -- Delivery charge from configured zone (never client-supplied)
  SELECT z.charge INTO v_charge
    FROM public.delivery_zones z
   WHERE z.district = p->>'district' AND z.is_active;
  IF v_charge IS NULL THEN
    RAISE EXCEPTION 'DISTRICT_NOT_SERVICED';
  END IF;

  -- Validate every line and lock variant rows
  FOR v_item IN SELECT * FROM jsonb_array_elements(p->'items') LOOP
    v_qty := (v_item->>'quantity')::int;
    IF v_qty IS NULL OR v_qty < 1 OR v_qty > 10 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY';
    END IF;
    SELECT pv.id, pv.stock, pv.sku, pv.colour_name, pv.product_id,
           pr.name, coalesce(pr.sale_price, pr.price) AS unit_price
      INTO v_variant
      FROM public.product_variants pv
      JOIN public.products pr ON pr.id = pv.product_id
     WHERE pv.id = (v_item->>'variant_id')::uuid
       AND pv.is_active AND pr.status = 'active'
     FOR UPDATE OF pv;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'VARIANT_UNAVAILABLE';
    END IF;
    IF v_variant.stock < v_qty THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK';
    END IF;
    v_subtotal := v_subtotal + v_variant.unit_price * v_qty;
  END LOOP;

  v_reference := public.generate_order_reference();

  INSERT INTO public.orders (
    reference, customer_id, customer_name, customer_phone,
    address_line, district, area, instructions,
    subtotal, delivery_charge, total, status, idempotency_key
  ) VALUES (
    v_reference,
    (p->>'customer_id')::uuid,
    p->>'customer_name',
    p->>'customer_phone',
    p->>'address_line',
    p->>'district',
    p->>'area',
    p->>'instructions',
    v_subtotal, v_charge, v_subtotal + v_charge, 'pending_review', nullif(p->>'idempotency_key','')
  ) RETURNING id INTO v_order_id;

  -- Snapshot items, decrement stock, log movements
  FOR v_item IN SELECT * FROM jsonb_array_elements(p->'items') LOOP
    v_qty := (v_item->>'quantity')::int;
    SELECT pv.sku, pv.colour_name, pv.product_id, coalesce(pr.sale_price, pr.price) AS unit_price, pv.stock
      INTO v_variant
      FROM public.product_variants pv
      JOIN public.products pr ON pr.id = pv.product_id
     WHERE pv.id = (v_item->>'variant_id')::uuid;

    v_unit_price := v_variant.unit_price;
    v_line_total := v_unit_price * v_qty;

    INSERT INTO public.order_items (
      order_id, product_id, variant_id, product_name, variant_name,
      sku, unit_price, quantity, line_total
    ) VALUES (
      v_order_id, v_variant.product_id, v_variant.id, v_variant.name,
      v_variant.colour_name, v_variant.sku, v_unit_price, v_qty, v_line_total
    );

    UPDATE public.product_variants
       SET stock = stock - v_qty
     WHERE id = v_variant.id;

    INSERT INTO public.inventory_movements (
      product_id, variant_id, delta, stock_after, reason, order_id
    ) VALUES (
      v_variant.product_id, v_variant.id, -v_qty, v_variant.stock - v_qty, 'sale', v_order_id
    );
  END LOOP;

  INSERT INTO public.order_status_history (order_id, from_status, to_status)
  VALUES (v_order_id, NULL, 'pending_review');

  RETURN jsonb_build_object('reference', v_reference, 'order_id', v_order_id, 'duplicate', false);
END $$;

-- Status transitions with automatic restock on cancellation
CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id uuid,
  p_to public.order_status,
  p_admin_id uuid,
  p_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from public.order_status;
  v_line record;
BEGIN
  SELECT status INTO v_from FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF v_from IS NULL THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;
  IF v_from = p_to THEN
    RETURN;
  END IF;
  IF v_from = 'cancelled' OR v_from = 'delivered' THEN
    RAISE EXCEPTION 'INVALID_TRANSITION';
  END IF;

  UPDATE public.orders SET status = p_to, updated_at = now() WHERE id = p_order_id;

  INSERT INTO public.order_status_history (order_id, from_status, to_status, note, changed_by)
  VALUES (p_order_id, v_from, p_to, p_note, p_admin_id);

  IF p_to = 'cancelled' THEN
    FOR v_line IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
      UPDATE public.product_variants
         SET stock = stock + v_line.quantity
       WHERE id = v_line.variant_id;
      INSERT INTO public.inventory_movements (
        product_id, variant_id, delta, stock_after, reason, order_id, admin_user_id, note
      ) VALUES (
        v_line.product_id, v_line.variant_id, v_line.quantity,
        (SELECT stock FROM public.product_variants WHERE id = v_line.variant_id),
        'cancellation', p_order_id, p_admin_id, 'order cancelled'
      );
    END LOOP;
  END IF;
END $$;

REVOKE EXECUTE ON FUNCTION public.create_order(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_order_status(uuid, public.order_status, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_order_status(uuid, public.order_status, uuid, text) TO service_role;
