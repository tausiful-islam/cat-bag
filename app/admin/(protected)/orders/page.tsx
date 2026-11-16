import Link from "next/link";
import { Download, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth/current-admin";
import { listOrders } from "@/lib/dal/orders";
import { formatBDT, formatDateTime, ORDER_STATUS_LABELS, orderStatusColor } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";


import type { OrderStatus } from "@/lib/types";

const TABS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending_review", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "dispatched", label: "Dispatched" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  await requireAdmin("orders.read");
  const sp = await searchParams;
  const status = sp.status ?? "all";
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const { items, total, perPage } = await listOrders({
    status: status as (typeof TABS)[number]["value"],
    search: sp.q,
    page,
  });
  const pages = Math.max(1, Math.ceil(total / perPage));

  const qs = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { status, q: sp.q, page: String(page), ...over };
    for (const [k, v] of Object.entries(merged)) if (v && v !== "all") p.set(k, v);
    const s = p.toString();
    return `/admin/orders${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl">Orders</h1>
        <a
          href="/admin/orders/csv"
          className="inline-flex items-center gap-2 border border-border bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] hover:border-foreground/30"
        >
          <Download className="h-4 w-4" /> Export CSV
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={qs({ status: t.value, page: "1" })}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs transition-colors",
              status === t.value
                ? "border-[var(--espresso)] bg-[var(--espresso)] text-[var(--ivory)]"
                : "border-border bg-white text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
        <form action="/admin/orders" className="ml-auto flex items-center gap-2">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Reference, name or phone…"
              className="w-64 bg-white pl-9 text-[13px]"
            />
          </div>
        </form>
      </div>

      <div className="border border-border bg-white">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Phone</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">District</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Placed</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No orders found.
                </td>
              </tr>
            ) : (
              items.map((o) => (
                <tr key={o.id} className="border-b border-border/60 hover:bg-[var(--sand)]/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-[var(--gold)]">
                      {o.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{o.customer_name}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{o.customer_phone}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">{o.district}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{formatDateTime(o.created_at)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`${orderStatusColor(o.status)} text-[11px]`}>
                      {ORDER_STATUS_LABELS[o.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatBDT(o.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-muted-foreground">
            Page {page} of {pages} · {total} orders
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={qs({ page: String(page - 1) })} className="border border-border bg-white px-4 py-2 hover:border-foreground/30">
                Previous
              </Link>
            )}
            {page < pages && (
              <Link href={qs({ page: String(page + 1) })} className="border border-border bg-white px-4 py-2 hover:border-foreground/30">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
