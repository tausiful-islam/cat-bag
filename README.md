# cat-bag — Premium Women's Handbag E-Commerce Platform

A production-minded e-commerce platform for a premium women's handbag
brand in Bangladesh. Quiet-luxury storefront + a powerful admin
dashboard, built on Next.js and Supabase.

> **Status:** fully functional storefront and admin. Customer
> sign-in (Clerk) is an integration-ready boundary — see
> `docs/CLERK-INTEGRATION.md`. Orders are gated behind sign-in until
> Clerk credentials arrive, as required.

## Stack

| Layer      | Technology                                          |
|------------|-----------------------------------------------------|
| Frontend   | Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS 4, shadcn/ui (Radix), Lucide icons |
| Backend    | Supabase PostgreSQL, Supabase Storage, SQL migrations + RPC functions |
| Validation | Zod + React Hook Form patterns                       |
| Admin      | TanStack-ready tables, Recharts analytics            |
| Testing    | Vitest + React Testing Library, Playwright           |
| Deploy     | Vercel                                               |

## Quick start

```bash
npm install
cp .env.example .env   # fill in values (see docs/ENVIRONMENT.md)
npm run dev
```

- Storefront: http://localhost:3000
- Admin: http://localhost:3000/admin — first sign-in claims the
  Owner account using `ADMIN_SETUP_TOKEN` (see below)
- Demo catalog: `python3 scripts/gen_placeholder_images.py && python3 scripts/seed_demo.py`
  (service key required — dev helper, clearly-marked sample data)

## Scripts

| Command             | Purpose                          |
|---------------------|----------------------------------|
| `npm run dev`       | Dev server                       |
| `npm run build`     | Production build                 |
| `npm start`         | Serve production build           |
| `npm run typecheck` | TypeScript strict check          |
| `npm run test`      | Unit tests (Vitest)              |
| `npm run test:e2e`  | End-to-end tests (Playwright)    |

## Architecture

```
app/
  (storefront)/     # public site — home, shop, collections, products,
                    # bag, checkout, confirmation, wishlist, search,
                    # account placeholder, legal pages
  admin/
    login/          # bootstrap token sign-in ( Clerk boundary later )
    (protected)/    # dashboard, orders, products, inventory,
                    # customers, categories, CMS, settings, admins,
                    # activity — guarded layout + per-action checks
  actions.ts        # storefront server actions (order submission)
lib/
  supabase/         # anon server client / service-role admin client / browser client
  auth/             # admin session (HMAC cookies), roles & permissions,
                    # customer boundary (Clerk-ready placeholder)
  dal/              # Data Access Layer — ALL privileged queries
  validation/       # Zod schemas
supabase/migrations # schema, RLS, seeds, atomic order RPCs
scripts/            # SQL runner, demo image generator, demo seeder
docs/               # this documentation set
```

## Security model

1. **RLS everywhere** — the anon key can only read the active public
   catalog. Orders, customers, admin data: no public policies at all
   (verified: anon reads return zero rows).
2. **Service-role key never leaves the server.** All privileged
   access goes through `lib/dal/*`, and every mutation re-checks
   permission via `requireAdmin(...)`.
3. **Atomic SQL functions** for order creation, status transitions
   and stock adjustments — server-validated prices, locked rows,
   idempotency keys, auto-restock on cancellation. Overselling is
   impossible even under concurrency.
4. **Admin auth** — HMAC-signed session cookies; roles are re-read
   from the database on every request. Bootstrap sign-in uses a
   one-time `ADMIN_SETUP_TOKEN` (constant-time compared) and will be
   replaced by Clerk when credentials arrive.
5. **Rate limiting** on order submission and admin sign-in.

## Documentation

- `docs/DATABASE.md` — schema + relationships
- `docs/ENVIRONMENT.md` — every variable, what it does, where it lives
- `docs/STORAGE.md` — Supabase Storage buckets + upload rules
- `docs/ADMIN.md` — running the store from the admin panel
- `docs/CLERK-INTEGRATION.md` — the exact steps when credentials arrive
- `docs/DEPLOYMENT.md` — Vercel deployment + operations
