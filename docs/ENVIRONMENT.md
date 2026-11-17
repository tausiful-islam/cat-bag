# Environment Variables

Copy `.env.example` to `.env`. **Never commit `.env`.** The repo's
`.gitignore` blocks it.

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | public key — RLS applies |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | bypasses RLS. Used exclusively inside `lib/dal/*` behind permission checks. Never expose. |
| `SESSION_SECRET` | server only | ≥32-byte hex used to HMAC-sign admin session cookies. Generate: `openssl rand -hex 32` |
| `ADMIN_SETUP_TOKEN` | server only | one-time token to claim the first Owner account at `/admin/login`. Compared in constant time. Rotate/blank after first sign-in. |
| `ORDERS_REQUIRE_AUTH` | server only | `true` (default) — checkout requires a signed-in customer. Set `false` **only** for local testing. Production stays `true` until Clerk is live. |
| `NEXT_PUBLIC_SITE_URL` | client + server | canonical site URL (Vercel domain in production). Drives sitemap/robots/OG tags. |

### Clerk (later stage — variables not yet set)

| Variable | Scope |
|----------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | client + server |
| `CLERK_SECRET_KEY` | server only |
| `CLERK_SUPABASE_JWT_ISSUER` | server only (native Clerk↔Supabase integration) |

When these exist, `lib/auth/current-customer.ts` activates — see
`docs/CLERK-INTEGRATION.md`.

## Production (Vercel)

Set the same variables in Project → Settings → Environment Variables
(Production + Preview). `NEXT_PUBLIC_SITE_URL` = your domain;
`ORDERS_REQUIRE_AUTH` = `true`.
