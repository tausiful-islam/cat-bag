# Database Schema

All migrations live in `supabase/migrations/` and are applied in
order. Apply them with `python3 scripts/apply-migration.py <file>`
(management API runner; no local Docker required).

## Entity overview

```
categories 1──* product_categories *──1 products
products 1──* product_variants          (colours, per-variant stock)
products 1──* product_images            (Supabase Storage paths)
customers 1──* customer_addresses
customers 1──1 wishlists 1──* wishlist_items *──1 products
customers 1──* orders 1──* order_items *── (snapshot) products/variants
orders 1──* order_status_history
orders/products ──* inventory_movements
admin_users 1──* admin_activity_logs
store_settings (KV, jsonb)   delivery_zones (64 districts)
announcements
```

## Key tables

| Table                    | Purpose |
|--------------------------|---------|
| `products`               | name, slug, sku (unique), price, sale_price, material, dimensions (cm), is_new, is_featured, status (draft/active/inactive/archived) |
| `product_variants`       | one row per colour: unique SKU, `stock ≥ 0` constraint, is_active |
| `product_images`         | storage_path + sort_order + alt text |
| `orders`                 | reference (CB-YYMMDD-XXXXXX, unique), customer snapshot fields, district, subtotal / delivery_charge / total (all server-computed), status enum, unique `idempotency_key` |
| `order_items`            | immutable snapshot: product name, variant, SKU, unit price at submission — order history survives product edits and archival |
| `order_status_history`   | full status timeline with admin attribution + notes |
| `inventory_movements`    | every stock change: delta, stock_after, reason (initial/restock/sale/cancellation/adjustment), order/admin reference |
| `admin_users`            | email, role enum (owner/administrator/order_manager/catalog_manager/content_manager), is_active, clerk_user_id (future) |
| `admin_activity_logs`    | action, entity, jsonb details, timestamp |
| `store_settings`         | jsonb per key: brand, contact.whatsapp, social, footer, announcement, homepage (hero/sections/editorial), features, orders |
| `delivery_zones`         | all 64 BD districts with configurable charge + ETA note |

## Design decisions

- **Order snapshots.** `order_items` copies name/price/SKU at
  submission. Products can be edited or archived freely — history is
  never corrupted.
- **No hard product deletes.** Orders reference products with
  `ON DELETE SET NULL`, but the admin UI only *archives*. Physical
  deletes exist solely in the initial clean-up migration.
- **Stock only via guarded paths.** Variant stock changes through
  `create_order` (sale), `update_order_status` (cancellation
  restock) or `adjust_variant_stock` (admin) — each writes a
  movement row in the same transaction.
- **Effective price** = `coalesce(sale_price, price)`, computed
  inside the order RPC; the browser never sends totals.

## RPC functions (service-role only)

| Function                | Guarantees |
|-------------------------|------------|
| `create_order(jsonb)`   | validates items/qty, locks variant rows (`FOR UPDATE`), rejects unavailable/oversold, reads zone charge, snapshots items, decrements stock, logs movements, generates unique reference — all atomic; idempotent via key |
| `update_order_status(...)` | legal transitions only, timeline entry, auto-restock on cancel |
| `adjust_variant_stock(...)` | atomic guarded update + movement log; refuses negative stock |
| `generate_order_reference()` | collision-checked CB-YYMMDD-XXXXXX |

All three entry points `REVOKE`d from `anon`/`authenticated`.

## Row Level Security

- Public read policies: active categories, active products (+images,
  variants, category links), non-sensitive store settings, active
  delivery zones, active announcements.
- Everything else — orders, order items, history, customers,
  addresses, wishlists, admin tables, inventory movements — has **no
  anon policy** (verified zero rows via anon key).
- Customer-scoped policies (my orders / wishlist / addresses) will be
  added with Clerk — see `docs/CLERK-INTEGRATION.md`.
