import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/current-admin";
import { getCustomerOrders } from "@/lib/dal/admin";
import { formatBDT, formatDateTime, ORDER_STATUS_LABELS, orderStatusColor } from "@/lib/format";
import { Badge } from "@/components/ui/badge";


export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  await requireAdmin("customers.read");
  const { phone } = await params;
  const decoded = decodeURIComponent(phone);
  if (!/^01\d{9}$|^\+?\d[\d\s-]+$/.test(decoded)) notFound();
  const orders = await getCustomerOrders(decoded);
  if (orders.length === 0) notFound();

  const totalValue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/customers" className="rounded-md border border-border bg-white p-2 hover:border-foreground/30">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl">{orders[0].customer_name}</h1>
          <p className="text-[13px] text-muted-foreground">{decoded} · since {formatDateTime(orders[orders.length - 1].created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Orders", value: String(orders.length) },
          { label: "Total order value", value: formatBDT(totalValue) },
          { label: "District", value: orders[0].district },
        ].map((s) => (
          <div key={s.label} className="border border-border bg-white p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{s.label}</p>
            <p className="mt-1.5 text-lg font-light">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="border border-border bg-white">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Placed</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border/60 hover:bg-[var(--sand)]/40">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-[var(--gold)]">{o.reference}</Link>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{formatDateTime(o.created_at)}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`${orderStatusColor(o.status)} text-[11px]`}>
                    {ORDER_STATUS_LABELS[o.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">{formatBDT(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
