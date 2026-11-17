# Clerk Integration (pending credentials)

The app is structured so Clerk drops in without refactoring. When
credentials arrive:

## 1. Install & configure

```bash
npm install @clerk/nextjs
```

Set env vars (see `docs/ENVIRONMENT.md`):
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.

## 2. Wrap the root layout

In `app/layout.tsx` wrap children with `<ClerkProvider>`. Mount
Clerk's `<SignIn />` / `<SignUp />` at:

- `app/(storefront)/account/page.tsx` — replace the placeholder
  ("Sign In — Opening Soon") with Clerk components
- `app/(storefront)/checkout/page.tsx` — replace the "Sign in
  required" panel with `<SignInButton mode="modal">` (the bag is
  already preserved via localStorage)

## 3. Activate the customer boundary — `lib/auth/current-customer.ts`

This file is the single integration point:

```ts
import { auth, currentUser } from "@clerk/nextjs/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getCurrentCustomer() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();

  const supabase = getSupabaseAdminClient();
  // upsert-on-read keeps customers in sync with Clerk
  const { data } = await supabase
    .from("customers")
    .upsert({
      clerk_user_id: userId,
      full_name: user?.fullName ?? null,
      email: user?.primaryEmailAddress?.emailAddress ?? null,
    }, { onConflict: "clerk_user_id" })
    .select()
    .single();
  return data;
}
```

Everything downstream (checkout, order creation, account pages)
already calls `getCurrentCustomer()` — no other changes needed.

## 4. Native Clerk ↔ Supabase integration (NOT the deprecated JWT template)

1. Clerk Dashboard → Configure → SSO Connections / **Supabase** —
   follow the guided connection for your Supabase project
   (`gfjcxmcbwumzuwwubolj`).
2. Add `CLERK_SUPABASE_JWT_ISSUER` env var.
3. Create a **server** Supabase client that forwards the Clerk
   session token — replace the anon client in customer-scoped reads:

```ts
import { createServerClient } from "@supabase/ssr";
import { auth } from "@clerk/nextjs/server";

export async function getSupabaseClerkClient() {
  const { getToken } = await auth();
  const token = await getToken({ template: "supabase" });
  return createServerClient(url, anonKey, {
    cookies: { getAll: () => [], setAll: () => {} },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}
```

> Prefer Clerk's current documented helper (`clerkBackend` /
> `createClerkSupabaseClient`) if the API has evolved — the principle
> stays: Clerk-issued Supabase JWT + native integration, not a
> hand-rolled JWT template.

## 5. RLS policies for customer data

With Clerk JWTs reaching Supabase, add:

```sql
-- customers: match on clerk_user_id claim
CREATE POLICY customer_read_own_orders ON public.orders
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM public.customers
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );
-- analogous policies for order_items (via order), customer_addresses,
-- wishlists, wishlist_items
```

Service-role paths (admin, order creation) bypass RLS and are
unaffected.

## 6. Admin sign-in migration

- Add `clerk_user_id` values to `admin_users` rows
- In `adminSignInAction` (or a new action), prefer verifying a Clerk
  session and mapping to an active `admin_users` row by
  `clerk_user_id`; keep the setup-token path only as break-glass for
  the Owner, then remove it

## 7. Verify

- [ ] Sign-up → place an order → order appears in admin
- [ ] Account page shows order history (own orders only — check with
      a second account)
- [ ] Wishlist/addresses scoped per customer
- [ ] Anon/token-less API reads of orders still blocked
