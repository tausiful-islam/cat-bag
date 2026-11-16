import "server-only";
import { cookies } from "next/headers";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminCookieName, decodeSessionCookie } from "./admin-session";
import type { AdminUserRow } from "@/lib/types";
import { PERMISSIONS, type AdminPermission } from "./permissions";
import type { AdminRole } from "@/lib/types";

/**
 * Admin authorization boundary.
 *
 * EVERY server action / route handler that touches privileged data
 * must call one of these functions — layout-level protection is not
 * sufficient security. Roles are always re-read from the database,
 * never trusted from the cookie or client.
 */

export async function getCurrentAdmin(): Promise<AdminUserRow | null> {
  const store = await cookies();
  const payload = decodeSessionCookie(store.get(adminCookieName)?.value);
  if (!payload) return null;

  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", payload.sub)
    .eq("is_active", true)
    .single();

  return (data as AdminUserRow) ?? null;
}

export function adminCan(admin: AdminUserRow, permission: AdminPermission): boolean {
  return PERMISSIONS[admin.role]?.includes(permission) ?? false;
}

/** Throws unless the current admin holds the permission. */
export async function requireAdmin(permission?: AdminPermission): Promise<AdminUserRow> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  if (permission && !adminCan(admin, permission)) throw new Error("FORBIDDEN");
  return admin;
}

export async function adminRoleLabel(role: AdminRole): Promise<string> {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
}
