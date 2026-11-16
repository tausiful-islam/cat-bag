import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client using the anon key.
 * Row Level Security applies: only public catalog data is readable.
 * Use for storefront reads (RSC / server actions).
 *
 * In build-time contexts (generateStaticParams, sitemap) where no
 * request exists, cookie binding is skipped — public reads don't
 * need sessions.
 */
export async function getSupabaseServerClient() {
  let cookieMethods:
    Parameters<typeof createServerClient>[2] extends infer T
      ? T extends { cookies: infer C }
        ? C
        : never
      : never;
  try {
    const cookieStore = await cookies();
    cookieMethods = {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component — safe to ignore.
        }
      },
    };
  } catch {
    cookieMethods = {
      getAll() {
        return [];
      },
      setAll() {
        /* no request context */
      },
    };
  }
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods },
  );
}
