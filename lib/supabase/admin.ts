import { createClient } from "@supabase/supabase-js";

/**
 * PRIVILEGED service-role client. Bypasses Row Level Security.
 *
 * SECURITY:
 *  - Server-side ONLY. Never import from a client component.
 *  - Never re-export the key or a client created with it.
 *  - Every call must be wrapped by the Data Access Layer, which
 *    independently verifies authorization before touching data.
 */
export function getSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
