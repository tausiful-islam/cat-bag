"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkoutSchema } from "@/lib/validation/schemas";
import { createOrder, OrderError } from "@/lib/dal/orders";
import { getCurrentCustomer, ordersRequireAuth } from "@/lib/auth/current-customer";
import { rateLimit } from "@/lib/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { adminCookieName, decodeSessionCookie } from "@/lib/auth/admin-session";
import {
  getAdminByEmail,
  touchAdminLogin,
  logActivity,
} from "@/lib/dal/admin";
import { newAdminSession } from "@/lib/auth/admin-session";
import { adminSignInSchema } from "@/lib/validation/schemas";
import crypto from "node:crypto";

export interface CheckoutState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function submitOrderAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`order:${ip}`, 6, 10 * 60 * 1000);
  if (!rl.ok) {
    return { error: "Too many attempts. Please wait a moment and try again." };
  }

  let customer = null;
  if (await ordersRequireAuth()) {
    customer = await getCurrentCustomer();
    if (!customer) {
      return { error: "Please sign in to place your order." };
    }
  }

  const raw = formData.get("payload");
  if (typeof raw !== "string") return { error: "Invalid request." };

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return { error: "Invalid request." };
  }

  const parsed = checkoutSchema.safeParse(parsedJson);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please review the highlighted fields.", fieldErrors };
  }

  const input = parsed.data;

  try {
    const { reference } = await createOrder({
      customer_id: customer?.id ?? null,
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      address_line: input.address_line,
      district: input.district,
      area: input.area || null,
      instructions: input.instructions || null,
      items: input.items.map((i) => ({ variant_id: i.variant_id, quantity: i.quantity })),
      idempotency_key: input.idempotency_key,
    });
    redirect(`/order-confirmation/${reference}`);
  } catch (err) {
    if (err instanceof OrderError) {
      return { error: err.message };
    }
    // redirect() throws a special error — rethrow it
    if (typeof err === "object" && err !== null && "digest" in err) throw err;
    console.error("order_failed", err);
    return { error: "We could not place your order. Please try again." };
  }
}

// ---------- Admin sign-in (bootstrap; replaced by Clerk later) ----------

export interface SignInState {
  error?: string;
}

export async function adminSignInAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.ok) {
    return { error: "Too many attempts. Please try again later." };
  }

  const parsed = adminSignInSchema.safeParse({
    email: formData.get("email"),
    setup_token: formData.get("setup_token"),
  });
  if (!parsed.success) return { error: "Enter a valid email and setup token." };

  const expected = process.env.ADMIN_SETUP_TOKEN;
  if (!expected) return { error: "Admin sign-in is not configured." };

  const a = Buffer.from(parsed.data.setup_token);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { error: "Invalid setup token." };
  }

  let admin = await getAdminByEmail(parsed.data.email);
  if (!admin) {
    // First sign-in with a valid setup token claims the Owner account.
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("admin_users")
      .insert({ email: parsed.data.email.toLowerCase(), name: "Owner", role: "owner" })
      .select()
      .single();
    if (error) return { error: "Could not create the owner account." };
    admin = data as import("@/lib/types").AdminUserRow;
    await logActivity({ adminId: admin.id, action: "admin.owner_claimed", entityType: "admin_user", entityId: admin.id });
  }

  if (!admin.is_active) return { error: "This admin account is disabled." };

  await touchAdminLogin(admin.id);
  await logActivity({ adminId: admin.id, action: "admin.signed_in", entityType: "admin_user", entityId: admin.id });

  const session = newAdminSession(admin.id);
  const store = await cookies();
  store.set(session.name, session.cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
  });

  redirect("/admin");
}

export async function adminSignOutAction(): Promise<void> {
  const store = await cookies();
  store.delete(adminCookieName);
  redirect("/admin/login");
}
