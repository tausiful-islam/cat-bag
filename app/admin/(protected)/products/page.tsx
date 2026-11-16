import Link from "next/link";
import Image from "next/image";
import { Plus, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth/current-admin";
import { adminListProducts } from "@/lib/dal/admin";
import { formatBDT, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";


const STATUS_TABS = ["all", "active", "draft", "inactive", "archived"];

const statusColor: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-800 border-emerald-200",
  draft: "bg-neutral-50 text-neutral-700 border-neutral-200",
  inactive: "bg-amber-50 text-amber-800 border-amber-200",
  archived: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdmin("products.read");
  const sp = await searchParams;
  const status = sp.status ?? "all";
  const products = await adminListProducts(sp.q, status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-[var(--espresso)] px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-[var(--ivory)] hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New Product
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((t) => (
          <Link
            key={t}
            href={`/admin/products${t === "all" ? "" : `?status=${t}`}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs capitalize transition-colors",
              status === t
                ? "border-[var(--espresso)] bg-[var(--espresso)] text-[var(--ivory)]"
                : "border-border bg-white text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </Link>
        ))}
        <form action="/admin/products" className="ml-auto flex items-center gap-2">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={sp.q ?? ""} placeholder="Name or SKU…" className="w-56 bg-white pl-9 text-[13px]" />
          </div>
        </form>
      </div>

      <div className="border border-border bg-white">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">SKU</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Categories</th>
              <th className="px-4 py-3 text-center font-medium">Stock</th>
              <th className="px-4 py-3 text-right font-medium">Price</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Updated</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No products found. <Link href="/admin/products/new" className="underline underline-offset-4">Create the first one</Link>.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-border/60 hover:bg-[var(--sand)]/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      <div className="img-frame relative h-12 w-10 shrink-0">
                        {p.thumbnail && <Image src={p.thumbnail} alt="" fill sizes="48px" className="object-cover" />}
                      </div>
                      <span className="min-w-0">
                        <span className="block truncate font-medium hover:text-[var(--gold)]">{p.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {p.is_new && "New · "}
                          {p.is_featured && "Featured"}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs md:table-cell">{p.sku}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                    {p.categories.map((c: { name: string }) => c.name).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={p.stock === 0 ? "font-medium text-destructive" : p.stock <= 3 ? "font-medium text-amber-700" : ""}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.sale_price != null ? (
                      <>
                        <span className="font-medium">{formatBDT(p.sale_price)}</span>{" "}
                        <s className="text-xs text-muted-foreground">{formatBDT(p.price)}</s>
                      </>
                    ) : (
                      formatBDT(p.price)
                    )}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <Badge variant="outline" className={`${statusColor[p.status]} text-[11px] capitalize`}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">{formatDate(p.updated_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
