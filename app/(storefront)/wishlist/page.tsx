"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/components/storefront/wishlist-context";
import { ProductGrid } from "@/components/storefront/product-grid";
import type { ProductCardData } from "@/lib/types";

export default function WishlistPage() {
  const { ids, ready, remove } = useWishlist();
  const [products, setProducts] = useState<ProductCardData[] | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    fetch(`/api/wishlist?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .catch(() => setProducts([]));
  }, [ids.join(","), ready]);

  const visible = (products ?? []).filter((p) => ids.includes(p.id));

  return (
    <div className="container-store py-10 lg:py-14">
      <h1 className="text-center font-serif text-3xl font-light sm:text-4xl">Wishlist</h1>

      {!ready || products === null ? (
        <div className="py-24 text-center text-sm text-muted-foreground">Loading…</div>
      ) : visible.length === 0 ? (
        <div className="py-24 text-center">
          <Heart className="mx-auto h-8 w-8 text-muted-foreground/40" strokeWidth={1} />
          <p className="mt-5 font-serif text-2xl italic text-muted-foreground">
            Your wishlist is empty
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap the heart on any product to save it here.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-block border border-[var(--espresso)] px-9 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors hover:bg-[var(--espresso)] hover:text-[var(--ivory)]"
          >
            Discover the Collection
          </Link>
        </div>
      ) : (
        <div className="mt-10">
          <ProductGrid products={visible} priorityCount={0} />
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => visible.forEach((p) => remove(p.id))}
              className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Clear wishlist
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
