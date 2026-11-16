import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getProductBySlug, getRelatedProducts } from "@/lib/dal/catalog";
import { getWhatsAppSettings } from "@/lib/dal/settings";
import { ProductDetail } from "@/components/storefront/product-detail";
import { ProductGrid } from "@/components/storefront/product-grid";
import { formatBDT } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description:
      (product.description ?? `${product.name} — premium handbag`).slice(0, 160),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: (product.description ?? "").slice(0, 200) || undefined,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, whatsapp] = await Promise.all([getProductBySlug(slug), getWhatsAppSettings()]);
  if (!product) notFound();

  const related = await getRelatedProducts(
    product.id,
    product.categories.map((c) => c.slug),
  );

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const productUrl = `${proto}://${host}/products/${product.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    sku: product.sku,
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: String(product.sale_price ?? product.price),
      availability:
        product.variants.some((v) => v.stock > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: productUrl,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail product={product} whatsappNumber={whatsapp.number} productUrl={productUrl} />
      {related.length > 0 && (
        <section className="border-t border-border/70 py-16">
          <div className="container-store">
            <h2 className="text-center font-serif text-2xl font-light sm:text-3xl">
              You May Also Like
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              From {formatBDT(Math.min(...related.map((r) => r.sale_price ?? r.price)))} and up
            </p>
            <div className="mt-10">
              <ProductGrid products={related} priorityCount={0} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
