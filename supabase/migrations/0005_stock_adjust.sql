-- Atomic stock adjustment with auditable movement log.
-- Returns true on success, false when the adjustment would go negative.

CREATE OR REPLACE FUNCTION public.adjust_variant_stock(
  p_variant_id uuid,
  p_delta int,
  p_reason public.inventory_reason,
  p_note text,
  p_admin_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product uuid;
  v_stock int;
BEGIN
  IF p_delta = 0 THEN
    RAISE EXCEPTION 'ZERO_DELTA';
  END IF;

  SELECT product_id, stock INTO v_product, v_stock
    FROM public.product_variants
   WHERE id = p_variant_id
   FOR UPDATE;

  IF v_product IS NULL THEN
    RAISE EXCEPTION 'VARIANT_NOT_FOUND';
  END IF;
  IF v_stock + p_delta < 0 THEN
    RETURN false;
  END IF;

  UPDATE public.product_variants
     SET stock = stock + p_delta, updated_at = now()
   WHERE id = p_variant_id;

  INSERT INTO public.inventory_movements (
    product_id, variant_id, delta, stock_after, reason, admin_user_id, note
  ) VALUES (
    v_product, p_variant_id, p_delta, v_stock + p_delta, p_reason, p_admin_id, p_note
  );

  RETURN true;
END $$;

REVOKE EXECUTE ON FUNCTION public.adjust_variant_stock(uuid, int, public.inventory_reason, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_variant_stock(uuid, int, public.inventory_reason, text, uuid) TO service_role;
