"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { formatBDT } from "@/lib/format";
import { useWishlist } from "./wishlist-context";
import type { ProductCardData } from "@/lib/types";

export function ProductCard({ product, priority }: { product: ProductCardData; priority?: boolean }) {
  const wishlist = useWishlist();
  const wished = wishlist.has(product.id);
  const onSale = product.sale_price != null && product.sale_price < product.price;

  return (
    <div className="group relative">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="img-frame aspect-[4/5]">
          {product.image_url ? (
            <>
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                priority={priority}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover transition-opacity duration-500 ${
                  product.hover_image_url ? "group-hover:opacity-0" : ""
                }`}
              />
              {product.hover_image_url && (
                <Image
                  src={product.hover_image_url}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-serif text-lg italic text-muted-foreground/60">{product.name}</span>
            </div>
          )}
          {product.is_new && (
            <span className="absolute left-3 top-3 bg-background/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em]">
              New
            </span>
          )}
        </div>
      </Link>

      <button
        type="button"
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wished}
        onClick={() => wishlist.toggle(product.id)}
        className="absolute right-2.5 top-2.5 rounded-full bg-background/80 p-2 opacity-0 backdrop-blur-sm transition-opacity duration-300 focus-visible:opacity-100 group-hover:opacity-100 max-lg:opacity-100"
      >
        <Heart
          className={`h-4 w-4 transition-colors ${wished ? "fill-[var(--gold)] text-[var(--gold)]" : "text-foreground/70"}`}
          strokeWidth={1.5}
        />
      </button>

      <div className="pt-3.5 text-center">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="text-[13px] font-medium uppercase tracking-[0.08em] leading-snug">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {onSale ? (
            <>
              <span className="text-foreground">{formatBDT(product.sale_price)}</span>{" "}
              <s className="text-muted-foreground/70">{formatBDT(product.price)}</s>
            </>
          ) : (
            formatBDT(product.price)
          )}
        </p>
        {product.colours.length > 0 && (
          <div className="mt-2 flex items-center justify-center gap-1.5">
            {product.colours.slice(0, 5).map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-2.5 w-2.5 rounded-full border border-black/15"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
