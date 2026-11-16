import { Suspense } from "react";
import { listProducts, type ListOptions } from "@/lib/dal/catalog";
import { ProductGrid } from "@/components/storefront/product-grid";
import { FilterControls } from "@/components/storefront/filter-controls";
import { Skeleton } from "@/components/ui/skeleton";

export interface ListingSearchParams {
  colour?: string | string[];
  material?: string | string[];
  min?: string;
  max?: string;
  stock?: string;
  sort?: string;
}

export function paramsToListOptions(sp: ListingSearchParams): ListOptions {
  return {
    colours: Array.isArray(sp.colour) ? sp.colour : sp.colour ? [sp.colour] : undefined,
    materials: Array.isArray(sp.material) ? sp.material : sp.material ? [sp.material] : undefined,
    priceMin: sp.min ? Number(sp.min) : undefined,
    priceMax: sp.max ? Number(sp.max) : undefined,
    inStockOnly: sp.stock === "1",
    sort: (sp.sort as ListOptions["sort"]) ?? "newest",
  };
}

export async function ListingView({
  categorySlug,
  searchParams,
}: {
  categorySlug?: string;
  searchParams: ListingSearchParams;
}) {
  const { items, total, facets } = await listProducts({
    ...paramsToListOptions(searchParams),
    categorySlug,
  });

  return (
    <div className="container-store flex gap-12 pb-20 pt-8 lg:pt-12">
      <Suspense fallback={null}>
        <FilterControls facets={facets} total={total} />
      </Suspense>
      <div className="min-w-0 flex-1">
        <ProductGrid products={items} />
      </div>
    </div>
  );
}

export function ListingSkeleton() {
  return (
    <div className="container-store flex gap-12 pb-20 pt-8 lg:pt-12">
      <div className="hidden w-56 shrink-0 lg:block">
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[4/5] w-full" />
            <Skeleton className="mx-auto mt-3 h-4 w-2/3" />
            <Skeleton className="mx-auto mt-2 h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
