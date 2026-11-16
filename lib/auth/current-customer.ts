import "server-only";

/**
 * Customer authentication boundary.
 *
 * STATUS: integration-ready placeholder. Clerk credentials have not
 * been supplied yet — this module is the SINGLE place that will wire
 * them in (see docs/CLERK-INTEGRATION.md). Nothing else in the
 * codebase may decide "who is the customer".
 *
 * Until Clerk is configured, `getCurrentCustomer()` returns null and
 * order submission is gated by ORDERS_REQUIRE_AUTH=true.
 */

export interface CurrentCustomer {
  id: string;            // customers.id
  clerkUserId: string;   // Clerk subject
  fullName: string | null;
  phone: string | null;
  email: string | null;
}

export function clerkConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
  );
}

export async function getCurrentCustomer(): Promise<CurrentCustomer | null> {
  // TODO(CLERK): const { userId } = await auth();
  // if (!userId) return null;
  // Map Clerk user -> customers row via customers.clerk_user_id and
  // return the row. See docs/CLERK-INTEGRATION.md.
  return null;
}

export async function ordersRequireAuth(): Promise<boolean> {
  // Once Clerk is live this is always true in production.
  const flag = process.env.ORDERS_REQUIRE_AUTH;
  return flag !== undefined ? flag === "true" : true;
}
