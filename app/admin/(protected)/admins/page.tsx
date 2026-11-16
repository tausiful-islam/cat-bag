import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/current-admin";
import { listAdmins } from "@/lib/dal/admin";
import { ROLE_DESCRIPTIONS } from "@/lib/auth/permissions";
import { AdminUserDialog } from "@/components/admin/admin-user-dialog";
import { Badge } from "@/components/ui/badge";
import type { AdminRole } from "@/lib/types";


const ROLE_LABELS: Record<AdminRole, string> = {
  owner: "Owner",
  administrator: "Administrator",
  order_manager: "Order Manager",
  catalog_manager: "Catalog Manager",
  content_manager: "Content Manager",
};

export default async function AdminUsersPage() {
  await requireAdmin("admins.read");
  const admins = await listAdmins();
  const roles = (Object.keys(ROLE_LABELS) as AdminRole[]).map((r) => ({
    value: r,
    label: ROLE_LABELS[r],
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl">Admin Users</h1>
        <AdminUserDialog
          roles={roles}
          trigger={
            <span className="inline-flex items-center gap-2 bg-[var(--espresso)] px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-[var(--ivory)] hover:opacity-90">
              <Plus className="h-4 w-4" /> New Admin
            </span>
          }
        />
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Admin sign-in currently uses the one-time setup token from the environment as a
        bootstrap; it will migrate to Clerk when credentials are supplied. Disabling an admin
        revokes access immediately — roles are always read fresh from the database.
      </p>

      <div className="border border-border bg-white">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Last login</th>
              <th className="px-4 py-3 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-b border-border/60">
                <td className="px-4 py-3 font-medium">{a.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.email}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-[11px]">{ROLE_LABELS[a.role]}</Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="outline" className={a.is_active ? "border-emerald-200 bg-emerald-50 text-emerald-800 text-[11px]" : "text-[11px] text-muted-foreground"}>
                    {a.is_active ? "Active" : "Disabled"}
                  </Badge>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                  {a.last_login_at ? new Date(a.last_login_at).toLocaleString("en-GB") : "Never"}
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminUserDialog
                    roles={roles}
                    initial={{ id: a.id, email: a.email, name: a.name, role: a.role, is_active: a.is_active }}
                    trigger={<span className="cursor-pointer text-xs underline underline-offset-4 hover:text-[var(--gold)]">Edit</span>}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {(Object.keys(ROLE_DESCRIPTIONS) as AdminRole[]).map((r) => (
          <div key={r} className="border border-border bg-white p-4">
            <p className="text-xs font-medium">{ROLE_LABELS[r]}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{ROLE_DESCRIPTIONS[r]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
