import Link from "next/link";
import { ArrowRight, PackagePlus, ShoppingCart } from "lucide-react";
import { requireAdmin } from "@/lib/auth/current-admin";
import { getOrderCounts, getRecentOrders, getOrdersByDay, getBestSellers } from "@/lib/dal/orders";
import { adminListProducts } from "@/lib/dal/admin";
import { formatBDT, formatDateTime, ORDER_STATUS_LABELS, orderStatusColor } from "@/lib/format";
import { OrdersChart, BestSellersChart } from "@/components/admin/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


export default async function AdminDashboardPage() {
  const admin = await requireAdmin("dashboard.view");
  const [counts, recent, byDay, best, products] = await Promise.all([
    getOrderCounts(),
    getRecentOrders(8),
    getOrdersByDay(30),
    getBestSellers(5),
    adminListProducts(),
  ]);

  const lowStock = products.filter((p) => p.status === "active" && p.stock > 0 && p.stock <= 3);
  const outOfStock = products.filter((p) => p.status === "active" && p.stock === 0);
  const activeProducts = products.filter((p) => p.status === "active");

  const tiles = [
    { label: "Orders Today", value: counts.today ?? 0, href: "/admin/orders" },
    { label: "Pending Review", value: counts.pending_review ?? 0, href: "/admin/orders?status=pending_review" },
    { label: "Confirmed", value: counts.confirmed ?? 0, href: "/admin/orders?status=confirmed" },
    { label: "Processing", value: counts.processing ?? 0, href: "/admin/orders?status=processing" },
    { label: "Dispatched", value: counts.dispatched ?? 0, href: "/admin/orders?status=dispatched" },
    { label: "Delivered", value: counts.delivered ?? 0, href: "/admin/orders?status=delivered" },
    { label: "Cancelled", value: counts.cancelled ?? 0, href: "/admin/orders?status=cancelled" },
    { label: "Total Products", value: products.length, href: "/admin/products" },
    { label: "Active Products", value: activeProducts.length, href: "/admin/products?status=active" },
    { label: "Low Stock", value: lowStock.length, href: "/admin/inventory?filter=low" },
    { label: "Out of Stock", value: outOfStock.length, href: "/admin/inventory?filter=out" },
    { label: "Total Orders", value: counts.total ?? 0, href: "/admin/orders" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl">Dashboard</h1>
          <p className="text-[13px] text-muted-foreground">
            Welcome back, {admin.name.split(" ")[0]} — order values shown are submitted value,
            not collected revenue.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-[var(--espresso)] px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-[var(--ivory)] hover:opacity-90"
          >
            <PackagePlus className="h-4 w-4" /> Add Product
          </Link>
          <Link
            href="/admin/orders?status=pending_review"
            className="inline-flex items-center gap-2 border border-border bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] hover:border-foreground/30"
          >
            <ShoppingCart className="h-4 w-4" /> Review Pending
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href}>
            <Card className="border-border bg-white transition-shadow hover:shadow-sm">
              <CardContent className="p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {t.label}
                </p>
                <p className="mt-1.5 text-2xl font-light">{t.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card className="border-border bg-white">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-medium">Orders — last 30 days</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <OrdersChart data={byDay} />
          </CardContent>
        </Card>
        <Card className="border-border bg-white">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-medium">Best sellers (units)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {best.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No sales yet.</p>
            ) : (
              <BestSellersChart data={best} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
          <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
          <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Placed</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-b border-border/60 hover:bg-[var(--sand)]/40">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-[var(--gold)]">
                        {o.reference}
                      </Link>
                    </td>
                    <td className="px-5 py-3">{o.customer_name}</td>
                    <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">{formatDateTime(o.created_at)}</td>
                    <td className="px-5 py-3">
                      <Badge variant="outline" className={`${orderStatusColor(o.status)} text-[11px]`}>
                        {ORDER_STATUS_LABELS[o.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">{formatBDT(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
