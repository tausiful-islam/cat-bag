import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin, adminCan } from "@/lib/auth/current-admin";
import { getBrandSettings } from "@/lib/dal/settings";
import { AdminShell, type IconKey } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Admin" },
  robots: { index: false, follow: false },
};

// NOTE: This layout improves UX only. Real security lives in every
// server action and route handler via requireAdmin(permission).

const NAV: { href: string; label: string; icon: IconKey; permission: Parameters<typeof adminCan>[1] }[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", permission: "dashboard.view" },
  { href: "/admin/orders", label: "Orders", icon: "orders", permission: "orders.read" },
  { href: "/admin/products", label: "Products", icon: "products", permission: "products.read" },
  { href: "/admin/inventory", label: "Inventory", icon: "inventory", permission: "inventory.read" },
  { href: "/admin/customers", label: "Customers", icon: "customers", permission: "customers.read" },
  { href: "/admin/categories", label: "Categories", icon: "categories", permission: "categories.read" },
  { href: "/admin/content", label: "Homepage CMS", icon: "content", permission: "content.read" },
  { href: "/admin/settings", label: "Settings", icon: "settings", permission: "settings.read" },
  { href: "/admin/admins", label: "Admin Users", icon: "admins", permission: "admins.read" },
  { href: "/admin/activity", label: "Activity Log", icon: "activity", permission: "activity.read" },
];

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const [brand] = await Promise.all([getBrandSettings()]);
  const items = NAV.filter((n) => adminCan(admin, n.permission)).map(
    ({ href, label, icon }) => ({ href, label, icon }),
  );

  return (
    <AdminShell
      items={items}
      brandName={brand.name}
      adminName={admin.name}
      adminRole={admin.role}
    >
      {children}
    </AdminShell>
  );
}
