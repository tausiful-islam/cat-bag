import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (anon key). RLS applies.
 * Currently used for lightweight public reads if a client
 * component needs them; all mutations go through server actions.
 */
export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
