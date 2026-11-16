import { ProductCard } from "./product-card";
import type { ProductCardData } from "@/lib/types";

export function ProductGrid({
  products,
  columns = 4,
  priorityCount = 4,
}: {
  products: ProductCardData[];
  columns?: 3 | 4;
  priorityCount?: number;
}) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-serif text-2xl italic text-muted-foreground">Nothing here yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          New pieces are being selected for this collection — please check back soon.
        </p>
      </div>
    );
  }
  const cols =
    columns === 3
      ? "grid-cols-2 sm:grid-cols-3"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  return (
    <div className={`grid gap-x-4 gap-y-10 sm:gap-x-6 ${cols}`}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}
