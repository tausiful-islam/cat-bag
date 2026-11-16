import Link from "next/link";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth/current-admin";
import { adminListCustomers } from "@/lib/dal/admin";
import { formatBDT, formatDate } from "@/lib/format";
import { Input } from "@/components/ui/input";


export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin("customers.read");
  const { q } = await searchParams;
  const customers = await adminListCustomers(q);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl">Customers</h1>
        <form action="/admin/customers" className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={q ?? ""} placeholder="Name or phone…" className="w-56 bg-white pl-9 text-[13px]" />
          </div>
        </form>
      </div>

      <p className="text-xs text-muted-foreground">
        Customers are grouped by contact number from their orders. Values shown are total
        order value, not collected revenue.
      </p>

      <div className="border border-border bg-white">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 text-center font-medium">Orders</th>
              <th className="px-4 py-3 text-right font-medium">Total order value</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Last order</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No customers yet.</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c.phone} className="border-b border-border/60 hover:bg-[var(--sand)]/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${encodeURIComponent(c.phone)}`} className="font-medium hover:text-[var(--gold)]">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3 text-center">{c.orders}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatBDT(c.value)}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{formatDate(c.last_order)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
