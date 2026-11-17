# Admin Guide

Reach the admin at `/admin`. Until Clerk integration, sign-in uses a
bootstrap flow:

1. Set `ADMIN_SETUP_TOKEN` (random string) in the environment.
2. Sign in at `/admin/login` with **your email + the token**.
3. The first sign-in creates the **Owner** account with that email.
   Later sign-ins require the same token until Clerk arrives — treat
   it like a shared password and rotate it.

Roles: Owner, Administrator, Order Manager, Catalog Manager, Content
Manager — permissions in `lib/auth/permissions.ts`. Disabling an
admin revokes access on their next request.

## Daily operations

### Orders (`/admin/orders`)
- Tabs per status; search by reference / name / phone
- Open an order for: items with photos, totals, customer + delivery
  info, editable delivery fields, status timeline, internal notes
- **Status flow:** Pending Review → Confirmed → Processing →
  Dispatched → Delivered (or Cancelled from pre-dispatch states).
  Cancelling automatically restores stock.
- **WhatsApp Customer** button opens a chat with a prefilled order
  message (uses the customer's phone)
- **Print / Packing Slip** prints a clean summary
- **Export CSV** downloads all orders

### Products (`/admin/products`)
- Create → fill basics/pricing → publish → **then** upload photos and
  add colour variants on the edit page
- Statuses: draft / active / inactive / archived — archived products
  keep order history intact
- Flags: **New In** (homepage + nav category), **Featured**
  (homepage Featured Edit)

### Inventory (`/admin/inventory`)
- Per-variant stock with low/out filters
- Adjust (±) with reason + note — every change is written to the
  movement log with your name and timestamp
- Sales and cancellations adjust stock automatically

### Customers (`/admin/customers`)
- Grouped by phone number (order-based), order counts + total order
  value (submitted value, not collected revenue)

### Categories (`/admin/categories`)
- Add/edit, sort order drives the storefront nav, show/hide per
  category, upload category tile images
- *Personalisation* stays hidden until the service is real — enable
  it in Settings → Features

### Homepage CMS (`/admin/content`)
- Hero heading/sentence/CTA/hero image upload
- Announcement bar toggle + text
- Section toggles (hero, categories, new arrivals, featured,
  editorial, discover)

### Settings (`/admin/settings`)
- Brand name/tagline/description (placeholder: "Maison Noor" — change
  freely), logo upload
- **WhatsApp number** — empty by default; ALL WhatsApp buttons hide
  until you set a real number
- Social links, footer text, feature flags
- **Delivery charges** (`/admin/settings/delivery`): all 64
  districts, default ৳0 = not configured. Set real charges before
  launch — checkout shows exactly these values

### Admin Users & Activity (`/admin/admins`, `/admin/activity`)
- Manage admins/roles (last-owner protection built in)
- Full audit log of every privileged action

## Before launch checklist

- [ ] Replace demo products & generated placeholder images
- [ ] Set real WhatsApp number
- [ ] Set delivery charges per district
- [ ] Finalize legal pages (privacy/terms/returns contain template text)
- [ ] Rotate `ADMIN_SETUP_TOKEN`, verify `ORDERS_REQUIRE_AUTH=true`
