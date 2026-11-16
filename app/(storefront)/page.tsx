import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBrandSettings, getHomepageSettings } from "@/lib/dal/settings";
import {
  getCategoriesWithImages,
  getFeaturedProducts,
  getNewArrivals,
} from "@/lib/dal/catalog";
import { ProductGrid } from "@/components/storefront/product-grid";
import { publicUrl, STORAGE_BUCKETS } from "@/lib/storage";

export default async function HomePage() {
  const [brand, home, categories, newArrivals, featured] = await Promise.all([
    getBrandSettings(),
    getHomepageSettings(),
    getCategoriesWithImages(),
    getNewArrivals(8),
    getFeaturedProducts(4),
  ]);
  const s = home.sections;
  const heroImage = home.hero.image_path
    ? publicUrl(STORAGE_BUCKETS.brand, home.hero.image_path)
    : null;

  return (
    <>
      {s.hero && (
        <section className="relative">
          <div className="relative h-[78vh] min-h-[480px] w-full overflow-hidden bg-[#e9e2d3] sm:h-[82vh]">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={home.hero.heading || "Collection"}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-[#efe9dc] via-[#e7dfcf] to-[#ddd2bc]" />
            )}
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-[12vh] text-center">
              <div className="container-store">
                {brand.tagline && (
                  <p className="eyebrow mb-4 !text-[#3d352a]">{brand.tagline}</p>
                )}
                <h1 className="font-serif text-4xl font-light leading-[1.05] text-[#231c14] sm:text-5xl lg:text-7xl">
                  {home.hero.heading}
                </h1>
                <p className="mx-auto mt-5 max-w-md text-[13px] leading-relaxed text-[#3d352a]/85 sm:text-sm">
                  {home.hero.subheading}
                </p>
                <Link
                  href={home.hero.cta_href || "/shop"}
                  className="mt-8 inline-block border border-[#231c14] bg-[#231c14]/0 px-9 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#231c14] transition-colors hover:bg-[#231c14] hover:text-[#f6f1e7]"
                >
                  {home.hero.cta_label}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {s.categories && categories.length > 0 && (
        <section className="container-store py-16 lg:py-20">
          <div className="text-center">
            <p className="eyebrow">Explore</p>
            <h2 className="mt-2 font-serif text-3xl font-light sm:text-4xl">Shop by Category</h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {categories.slice(0, 4).map((c) => (
              <Link key={c.id} href={`/collections/${c.slug}`} className="group">
                <div className="img-frame aspect-[3/4]">
                  {c.image_url ? (
                    <Image
                      src={c.image_url}
                      alt={c.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#e9e2d3]">
                      <span className="font-serif text-xl italic text-[#4a4136]">{c.name}</span>
                    </div>
                  )}
                </div>
                <h3 className="mt-3.5 text-center text-[12px] font-medium uppercase tracking-[0.14em] group-hover:text-[var(--gold)]">
                  {c.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {s.new_arrivals && newArrivals.length > 0 && (
        <section className="container-store py-16 lg:py-20">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Just In</p>
              <h2 className="mt-2 font-serif text-3xl font-light sm:text-4xl">New Arrivals</h2>
            </div>
            <Link
              href="/collections/new-in"
              className="hidden items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground sm:inline-flex"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-9">
            <ProductGrid products={newArrivals} />
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/collections/new-in" className="eyebrow hover:text-foreground">
              View all new arrivals →
            </Link>
          </div>
        </section>
      )}

      {s.featured && featured.length > 0 && (
        <section className="bg-[var(--sand)]/70 py-16 lg:py-20">
          <div className="container-store">
            <div className="text-center">
              <p className="eyebrow">Selected</p>
              <h2 className="mt-2 font-serif text-3xl font-light sm:text-4xl">The Featured Edit</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Pieces our team returns to — considered silhouettes with quiet presence.
              </p>
            </div>
            <div className="mt-10">
              <ProductGrid products={featured} />
            </div>
          </div>
        </section>
      )}

      {s.editorial && (
        <section className="container-store py-16 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">Our Philosophy</p>
            <h2 className="mt-3 font-serif text-3xl font-light leading-tight sm:text-5xl">
              {home.editorial.heading}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.9] text-muted-foreground">
              {home.editorial.body}
            </p>
          </div>
        </section>
      )}

      {s.discover && (
        <section className="border-t border-border/70 py-14 lg:py-16">
          <div className="container-store flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="font-serif text-2xl font-light sm:text-3xl">
                Explore the full collection
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Every style, in one place — curated for everyday elegance.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 border border-[var(--espresso)] px-8 py-3 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors hover:bg-[var(--espresso)] hover:text-[var(--ivory)]"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
