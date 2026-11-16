import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingSkeleton, ListingView, type ListingSearchParams } from "@/components/storefront/listing-view";

export const metadata: Metadata = {
  title: "Shop All Handbags",
  description: "Browse the full collection of premium women's handbags — crossbody, shoulder, totes and accessories.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}) {
  const sp = await searchParams;
  return (
    <>
      <div className="border-b border-border/70 bg-[var(--sand)]/50 py-12 text-center lg:py-14">
        <h1 className="font-serif text-3xl font-light sm:text-4xl">All Handbags</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          The complete collection — considered silhouettes for everyday elegance.
        </p>
      </div>
      <Suspense fallback={<ListingSkeleton />}>
        <ListingView searchParams={sp} />
      </Suspense>
    </>
  );
}
