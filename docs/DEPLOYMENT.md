# Deployment (Vercel)

The project is deployed from the `main` branch via Vercel's API/CLI
using the provided token. Production URL is recorded in the final
delivery report; preview deploys run for every branch.

## Environment variables (Production + Preview)

See `docs/ENVIRONMENT.md`. Minimum set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET` (`openssl rand -hex 32`)
- `ADMIN_SETUP_TOKEN` (rotate after claiming Owner)
- `ORDERS_REQUIRE_AUTH=true`
- `NEXT_PUBLIC_SITE_URL=https://<your-domain>`

## Deploy steps (already applied)

1. Create project linked to the GitHub repo
2. Set env vars
3. Deploy `main` → verify build + smoke test
4. Add the production URL to Supabase Auth URL allow-list when Clerk
   integration lands

## Operations

- **Supabase pauses** on the free tier after inactivity; restore from
  the dashboard or management API (`POST /v1/projects/{ref}/restore`)
- Migrations: add `supabase/migrations/NNNN_*.sql`, apply with
  `python3 scripts/apply-migration.py <file>`
- Deployments: push to `main` (or redeploy from Vercel dashboard)
- Post-deploy checks: `/` renders, `/shop` lists products,
  `/admin/login` loads, `/sitemap.xml` + `/robots.txt` respond

## Custom domain

Vercel → Project → Domains → add domain, point DNS as instructed,
then update `NEXT_PUBLIC_SITE_URL`.
