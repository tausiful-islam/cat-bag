"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useBag } from "./bag-context";
import { useWishlist } from "./wishlist-context";
import { formatBDT } from "@/lib/format";
import { whatsappLink, productEnquiryMessage } from "@/lib/whatsapp";
import type { ProductDetailData } from "@/lib/types";

export function ProductDetail({
  product,
  whatsappNumber,
  productUrl,
}: {
  product: ProductDetailData;
  whatsappNumber: string;
  productUrl: string;
}) {
  const bag = useBag();
  const wishlist = useWishlist();
  const inStockVariants = product.variants;
  const [selected, setSelected] = useState(
    inStockVariants.find((v) => v.stock > 0)?.id ?? inStockVariants[0]?.id ?? "",
  );
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const variant = inStockVariants.find((v) => v.id === selected);
  const totalStock = inStockVariants.reduce((s, v) => s + v.stock, 0);
  const price = product.sale_price ?? product.price;
  const onSale = product.sale_price != null && product.sale_price < product.price;
  const wished = wishlist.has(product.id);

  const enquiryHref = useMemo(() => {
    if (!whatsappNumber) return null;
    return whatsappLink(
      whatsappNumber,
      productEnquiryMessage({
        productName: product.name,
        sku: variant?.sku ?? product.sku,
        url: productUrl,
        variantName: variant?.colour_name,
      }),
    );
  }, [whatsappNumber, product.name, variant?.sku, variant?.colour_name, product.sku, productUrl, productUrl.length, productUrl, product.name, productUrl, product, variant, productUrl]);

  const canAdd = variant != null && variant.stock > 0 && qty <= variant.stock;

  const handleAdd = () => {
    if (!variant || !canAdd) return;
    bag.addLine(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        variantName: variant.colour_name,
        sku: variant.sku,
        unitPrice: price,
        imageUrl: product.images[0]?.url ?? null,
        maxStock: variant.stock,
      },
      qty,
    );
    toast.success(`Added to bag — ${product.name}`);
  };

  const dims = [product.dim_l_cm, product.dim_w_cm, product.dim_h_cm].filter((d) => d != null);

  return (
    <div className="container-store pb-16 pt-6 lg:pt-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <Link href="/shop" className="hover:text-foreground">Shop</Link>
        {product.categories[0] && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/collections/${product.categories[0].slug}`} className="hover:text-foreground">
              {product.categories[0].name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            {product.images.length > 0 ? (
              product.images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`img-frame aspect-[4/5] w-[85vw] max-w-[480px] shrink-0 snap-center lg:w-auto lg:flex-1 ${
                    i === activeImage ? "ring-1 ring-[var(--gold)]" : ""
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? product.name}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 1024px) 85vw, 45vw"
                    className="object-cover"
                  />
                </button>
              ))
            ) : (
              <div className="img-frame aspect-[4/5] w-full">
                <div className="flex h-full items-center justify-center">
                  <span className="font-serif text-2xl italic text-muted-foreground/60">{product.name}</span>
                </div>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 hidden gap-3 lg:grid lg:grid-cols-5">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`Thumbnail ${i + 1}`}
                  className={`img-frame relative aspect-square ${i === activeImage ? "ring-1 ring-[var(--gold)]" : "opacity-70 hover:opacity-100"}`}
                >
                  <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:sticky lg:top-36 lg:self-start">
          {product.is_new && <p className="eyebrow !text-[var(--gold)]">New Arrival</p>}
          <h1 className="mt-2 font-serif text-3xl font-light leading-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-lg">
            {onSale ? (
              <>
                <span>{formatBDT(product.sale_price)}</span>{" "}
                <s className="text-muted-foreground/70">{formatBDT(product.price)}</s>
              </>
            ) : (
              formatBDT(product.price)
            )}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Ref. {variant?.sku ?? product.sku}
          </p>

          {product.description && (
            <div className="mt-6 max-w-prose text-sm leading-[1.85] text-muted-foreground">
              {product.description}
            </div>
          )}

          {/* Colour selection */}
          {inStockVariants.length > 0 && (
            <div className="mt-8">
              <div className="flex items-baseline justify-between">
                <h3 className="eyebrow">Colour</h3>
                {variant && <span className="text-xs text-muted-foreground">{variant.colour_name}</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {inStockVariants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    title={`${v.colour_name}${v.stock === 0 ? " — sold out" : ""}`}
                    aria-pressed={v.id === selected}
                    onClick={() => {
                      setSelected(v.id);
                      setQty(1);
                    }}
                    className={`relative h-9 w-9 rounded-full border transition-all ${
                      v.id === selected
                        ? "ring-1 ring-ring ring-offset-2 ring-offset-background"
                        : "border-black/10 hover:border-black/30"
                    } ${v.stock === 0 ? "cursor-not-allowed opacity-40" : ""}`}
                    style={{ backgroundColor: v.colour_hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          <p className="mt-6 text-sm">
            {totalStock === 0 ? (
              <span className="text-muted-foreground">Currently sold out</span>
            ) : variant && variant.stock <= 3 ? (
              <span className="text-[#8a6d3b]">Only {variant.stock} left in this colour</span>
            ) : (
              <span className="text-emerald-700">In stock</span>
            )}
          </p>

          {/* Quantity + Add */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="p-3 text-muted-foreground hover:text-foreground"
                disabled={qty <= 1}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center text-sm" aria-live="polite">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(10, q + 1, variant?.stock ?? 1))}
                className="p-3 text-muted-foreground hover:text-foreground"
                disabled={!variant || qty >= variant.stock}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!canAdd}
              className="flex min-w-[220px] flex-1 items-center justify-center gap-2.5 bg-[var(--espresso)] px-8 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--ivory)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
              {totalStock === 0 ? "Sold Out" : "Add to Bag"}
            </button>
            <button
              type="button"
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={wished}
              onClick={() => wishlist.toggle(product.id)}
              className="flex h-[52px] w-[52px] items-center justify-center border border-border transition-colors hover:border-foreground/40"
            >
              <Heart
                className={`h-[18px] w-[18px] ${wished ? "fill-[var(--gold)] text-[var(--gold)]" : "text-foreground/70"}`}
                strokeWidth={1.5}
              />
            </button>
          </div>

          {/* WhatsApp enquiry */}
          {enquiryHref && (
            <a
              href={enquiryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 border border-border py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/80 transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              Enquire on WhatsApp
            </a>
          )}

          {/* Details */}
          <div className="mt-10 space-y-4 border-t border-border pt-8 text-sm">
            {(product.material || dims.length > 0) && (
              <div>
                <h3 className="eyebrow mb-2">Details</h3>
                <ul className="space-y-1.5 text-muted-foreground">
                  {product.material && <li>Material — {product.material}</li>}
                  {dims.length === 3 && (
                    <li>
                      Dimensions — {product.dim_l_cm} × {product.dim_w_cm} × {product.dim_h_cm} cm
                    </li>
                  )}
                </ul>
              </div>
            )}
            <div>
              <h3 className="eyebrow mb-2">Delivery</h3>
              <p className="leading-relaxed text-muted-foreground">
                Delivery across Bangladesh. Charges are shown at order review and confirmed with
                you before dispatch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AddedToBagToast() {
  return (
    <span className="inline-flex items-center gap-2">
      <Check className="h-4 w-4" /> Added to bag
    </span>
  );
}
