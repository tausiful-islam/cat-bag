import type { AdminRole } from "@/lib/types";

/**
 * Permission catalogue for role-based access control.
 * `owner` implicitly has every permission.
 */

export type AdminPermission =
  | "dashboard.view"
  | "products.read"
  | "products.write"
  | "inventory.read"
  | "inventory.write"
  | "orders.read"
  | "orders.write"
  | "customers.read"
  | "categories.read"
  | "categories.write"
  | "content.read"
  | "content.write"
  | "settings.read"
  | "settings.write"
  | "admins.read"
  | "admins.write"
  | "activity.read";

const BASE: AdminPermission[] = ["dashboard.view"];

export const PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  owner: [
    "dashboard.view", "products.read", "products.write", "inventory.read", "inventory.write",
    "orders.read", "orders.write", "customers.read", "categories.read", "categories.write",
    "content.read", "content.write", "settings.read", "settings.write",
    "admins.read", "admins.write", "activity.read",
  ],
  administrator: [
    "dashboard.view", "products.read", "products.write", "inventory.read", "inventory.write",
    "orders.read", "orders.write", "customers.read", "categories.read", "categories.write",
    "content.read", "content.write", "settings.read", "settings.write",
    "admins.read", "activity.read",
  ],
  order_manager: ["dashboard.view", "orders.read", "orders.write", "customers.read", "inventory.read"],
  catalog_manager: [
    "dashboard.view", "products.read", "products.write",
    "inventory.read", "inventory.write", "categories.read", "categories.write",
  ],
  content_manager: ["dashboard.view", "content.read", "content.write", "categories.read", "settings.read"],
};

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  owner: "Complete access, including admin management and settings.",
  administrator: "Everything except managing other admins' roles.",
  order_manager: "Orders, customers and read-only inventory.",
  catalog_manager: "Products, categories and inventory.",
  content_manager: "Homepage content, announcements and footer.",
};

export { BASE };
