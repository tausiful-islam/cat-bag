import { requireAdmin } from "@/lib/auth/current-admin";
import { listActivity } from "@/lib/dal/admin";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";


export default async function ActivityPage() {
  await requireAdmin("activity.read");
  const logs = await listActivity(150);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">Activity Log</h1>

      <div className="border border-border bg-white">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Admin</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No activity recorded yet.</td></tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id} className="border-b border-border/60">
                  <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">{formatDateTime(l.created_at)}</td>
                  <td className="px-4 py-2.5">{l.admin_name ?? "System"}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="outline" className="text-[11px]">{l.action}</Badge>
                  </td>
                  <td className="hidden px-4 py-2.5 font-mono text-[11px] text-muted-foreground md:table-cell">
                    {l.details ? JSON.stringify(l.details) : ""}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
