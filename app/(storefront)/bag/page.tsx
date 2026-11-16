"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useBag } from "@/components/storefront/bag-context";
import { formatBDT } from "@/lib/format";

export default function BagPage() {
  const { lines, subtotal, setQuantity, removeLine, ready } = useBag();

  return (
    <div className="container-store min-h-[60vh] py-10 lg:py-14">
      <h1 className="text-center font-serif text-3xl font-light sm:text-4xl">Shopping Bag</h1>

      {!ready ? (
        <div className="py-24 text-center text-sm text-muted-foreground">Loading your bag…</div>
      ) : lines.length === 0 ? (
        <div className="py-24 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/50" strokeWidth={1} />
          <p className="mt-5 font-serif text-2xl italic text-muted-foreground">Your bag is empty</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Explore the collection to find something you love.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-block border border-[var(--espresso)] px-9 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors hover:bg-[var(--espresso)] hover:text-[var(--ivory)]"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <ul className="divide-y divide-border border-y border-border">
            {lines.map((l) => (
              <li key={l.variantId} className="flex gap-5 py-6">
                <Link href={`/products/${l.slug}`} className="img-frame relative aspect-[4/5] w-24 shrink-0 sm:w-28">
                  {l.imageUrl ? (
                    <Image src={l.imageUrl} alt={l.name} fill sizes="120px" className="object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center font-serif text-sm italic text-muted-foreground/50">
                      {l.name}
                    </span>
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/products/${l.slug}`} className="text-[13px] font-medium uppercase tracking-[0.08em] hover:text-[var(--gold)]">
                        {l.name}
                      </Link>
                      {l.variantName && (
                        <p className="mt-1 text-xs text-muted-foreground">{l.variantName}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground/70">Ref. {l.sku}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${l.name}`}
                      onClick={() => removeLine(l.variantId)}
                      className="p-1.5 text-muted-foreground/60 hover:text-foreground"
                    >
                      <X className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center border border-border">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity(l.variantId, l.quantity - 1)}
                        className="p-2 text-muted-foreground hover:text-foreground"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-xs">{l.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQuantity(l.variantId, Math.min(10, l.quantity + 1))}
                        className="p-2 text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-sm">{formatBDT(l.unitPrice * l.quantity)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="lg:sticky lg:top-36 lg:self-start">
            <div className="border border-border bg-white p-7">
              <h2 className="eyebrow">Order Summary</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">{formatBDT(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className="text-xs">Calculated at order review</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-base">
                    <span>Total</span>
                    <span>{formatBDT(subtotal)}</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Delivery charge added for your district at review.
                  </p>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-7 flex items-center justify-center gap-2.5 bg-[var(--espresso)] px-8 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--ivory)] transition-opacity hover:opacity-90"
              >
                Review Order <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/shop"
                className="mt-3 block text-center text-[11px] uppercase tracking-[0.16em] text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Continue shopping
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
