import Link from "next/link";
import { requireAdmin } from "@/lib/auth/current-admin";
import { adminListCategories } from "@/lib/dal/admin";
import { CategoryDialog, NewCategoryButton } from "@/components/admin/category-dialog";
import { Badge } from "@/components/ui/badge";


export default async function CategoriesPage() {
  await requireAdmin("categories.read");
  const categories = await adminListCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl">Categories</h1>
        <NewCategoryButton />
      </div>

      <p className="text-xs text-muted-foreground">
        Sort order controls navigation sequence. Categories hidden from navigation remain
        reachable via collections URLs and search.
      </p>

      <div className="border border-border bg-white">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Slug</th>
              <th className="px-4 py-3 text-center font-medium">Products</th>
              <th className="px-4 py-3 text-center font-medium">In nav</th>
              <th className="px-4 py-3 text-center font-medium">Active</th>
              <th className="px-4 py-3 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c, i) => (
              <tr key={c.id} className="border-b border-border/60">
                <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground md:table-cell">{c.slug}</td>
                <td className="px-4 py-3 text-center">{c.product_count}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="outline" className={c.show_in_nav ? "border-emerald-200 bg-emerald-50 text-emerald-800 text-[11px]" : "text-[11px] text-muted-foreground"}>
                    {c.show_in_nav ? "Yes" : "No"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="outline" className={c.is_active ? "border-emerald-200 bg-emerald-50 text-emerald-800 text-[11px]" : "text-[11px] text-muted-foreground"}>
                    {c.is_active ? "Yes" : "No"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/collections/${c.slug}`} target="_blank" className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
                      View ↗
                    </Link>
                    <CategoryDialog
                      initial={{
                        id: c.id,
                        slug: c.slug,
                        name: c.name,
                        description: c.description ?? "",
                        sort_order: String(c.sort_order),
                        show_in_nav: c.show_in_nav,
                        is_active: c.is_active,
                      }}
                      trigger={<span className="cursor-pointer text-xs underline underline-offset-4 hover:text-[var(--gold)]">Edit</span>}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
