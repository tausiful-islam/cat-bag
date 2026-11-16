import type { Metadata } from "next";
import { searchProducts } from "@/lib/dal/catalog";
import { ProductGrid } from "@/components/storefront/product-grid";
import { SearchInput } from "@/components/storefront/search-input";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();
  const results = term.length >= 2 ? await searchProducts(term) : [];

  return (
    <div className="container-store py-10 lg:py-14">
      <h1 className="text-center font-serif text-3xl font-light sm:text-4xl">Search</h1>
      <div className="mx-auto mt-8 max-w-xl">
        <SearchInput initial={term} />
      </div>

      {term.length >= 2 && (
        <p className="mt-10 text-center text-xs uppercase tracking-[0.16em] text-muted-foreground">
          {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;{term}&rdquo;
        </p>
      )}
      <div className="mt-8">
        {term.length < 2 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Type at least two characters to search the collection.
          </p>
        ) : (
          <ProductGrid products={results} priorityCount={0} />
        )}
      </div>
    </div>
  );
}
