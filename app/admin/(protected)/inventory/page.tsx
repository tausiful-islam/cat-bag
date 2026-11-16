import Link from "next/link";
import { requireAdmin } from "@/lib/auth/current-admin";
import { getInventoryOverview, getStockMovements } from "@/lib/dal/admin";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { StockAdjuster } from "@/components/admin/stock-adjuster";


const REASON_LABEL: Record<string, string> = {
  initial: "Initial",
  restock: "Restock",
  sale: "Sale",
  cancellation: "Cancellation",
  adjustment: "Adjustment",
};

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requireAdmin("inventory.read");
  const { filter } = await searchParams;
  const [overview, movements] = await Promise.all([
    getInventoryOverview(),
    getStockMovements(undefined, 60),
  ]);

  const filtered = overview.filter((p) => {
    if (filter === "low") return p.total_stock > 0 && p.total_stock <= 3;
    if (filter === "out") return p.total_stock === 0;
    return true;
  });

  const lowCount = overview.filter((p) => p.total_stock > 0 && p.total_stock <= 3).length;
  const outCount = overview.filter((p) => p.total_stock === 0).length;

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">Inventory</h1>

      <div className="flex flex-wrap gap-2">
        {[
          { key: undefined, label: `All (${overview.length})` },
          { key: "low", label: `Low stock (${lowCount})` },
          { key: "out", label: `Out of stock (${outCount})` },
        ].map((t) => (
          <Link
            key={t.label}
            href={t.key ? `/admin/inventory?filter=${t.key}` : "/admin/inventory"}
            className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
              filter === t.key || (!filter && !t.key)
                ? "border-[var(--espresso)] bg-[var(--espresso)] text-[var(--ivory)]"
                : "border-border bg-white text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="border border-border bg-white">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">SKU</th>
              <th className="px-4 py-3 font-medium">Variant</th>
              <th className="px-4 py-3 text-center font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Adjust</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No products.</td></tr>
            ) : (
              filtered.flatMap((p) =>
                p.variants.map((v, vi) => (
                  <tr key={v.id} className="border-b border-border/60">
                    {vi === 0 ? (
                      <td rowSpan={p.variants.length} className="px-4 py-3 align-top">
                        <Link href={`/admin/products/${p.product_id}`} className="font-medium hover:text-[var(--gold)]">
                          {p.product_name}
                        </Link>
                      </td>
                    ) : null}
                    {vi === 0 ? (
                      <td rowSpan={p.variants.length} className="hidden px-4 py-3 align-top font-mono text-xs text-muted-foreground md:table-cell">
                        {p.sku}
                      </td>
                    ) : null}
                    <td className="px-4 py-3">
                      <span className="mr-2 inline-block h-3 w-3 rounded-full border border-black/10 align-middle" style={{ backgroundColor: v.colour_hex }} />
                      {v.colour_name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={v.stock === 0 ? "font-medium text-destructive" : v.stock <= 3 ? "font-medium text-amber-700" : ""}>
                        {v.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StockAdjuster variantId={v.id} />
                    </td>
                  </tr>
                )),
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="border border-border bg-white">
        <div className="border-b border-border px-4 py-3 text-sm font-medium">Recent Stock Movements</div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 text-center font-medium">Δ</th>
              <th className="px-4 py-3 text-center font-medium">After</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">By</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No movements recorded yet.</td></tr>
            ) : (
              movements.map((m) => (
                <tr key={m.id} className="border-b border-border/60">
                  <td className="px-4 py-2.5 text-muted-foreground">{formatDateTime(m.created_at)}</td>
                  <td className="px-4 py-2.5">
                    {m.product_name}
                    {m.variant_name ? ` — ${m.variant_name}` : ""}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant="outline" className="text-[11px]">{REASON_LABEL[m.reason] ?? m.reason}</Badge>
                  </td>
                  <td className={`px-4 py-2.5 text-center font-medium ${m.delta < 0 ? "text-destructive" : "text-emerald-700"}`}>
                    {m.delta > 0 ? `+${m.delta}` : m.delta}
                  </td>
                  <td className="px-4 py-2.5 text-center">{m.stock_after}</td>
                  <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">{m.admin_name ?? (m.order_id ? "Order" : "—")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
