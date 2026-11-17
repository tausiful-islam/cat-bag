import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Customer authentication boundary — Clerk is now live.
 * This module is the SINGLE place that decides "who is the customer".
 * Roles/admin data never come from here.
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
  if (!clerkConfigured()) return null;
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const phone = user?.primaryPhoneNumber?.phoneNumber ?? null;
  const fullName = user?.fullName ?? null;

  // Sync profile fields into our customers table (keyed by clerk id).
  // Upsert keeps name/email/phone fresh on each signed-in request.
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("customers")
    .upsert(
      { clerk_user_id: userId, full_name: fullName, email, phone },
      { onConflict: "clerk_user_id" },
    )
    .select()
    .single();

  if (error || !data) {
    console.error("customer_sync_failed", error?.message);
    return null;
  }
  return {
    id: data.id,
    clerkUserId: userId,
    fullName: data.full_name,
    phone: data.phone,
    email: data.email,
  };
}

export async function ordersRequireAuth(): Promise<boolean> {
  const flag = process.env.ORDERS_REQUIRE_AUTH;
  return flag !== undefined ? flag === "true" : true;
}
