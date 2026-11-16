import Link from "next/link";
import { getAnnouncementSettings, getBrandSettings } from "@/lib/dal/settings";
import { getNavCategories } from "@/lib/dal/catalog";
import { CategoryBar, HeaderIcons, MobileMenu } from "./header-nav";

export async function SiteHeader() {
  const [brand, categories, announcement] = await Promise.all([
    getBrandSettings(),
    getNavCategories(),
    getAnnouncementSettings(),
  ]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      {announcement.enabled && announcement.text && (
        <div className="bg-[var(--espresso)] px-4 py-2 text-center text-[11px] uppercase tracking-[0.18em] text-[var(--ivory)]">
          {announcement.text}
        </div>
      )}
      <div className="container-store">
        <div className="relative flex h-16 items-center justify-between lg:h-20">
          {/* Left: mobile menu / spacer on desktop */}
          <div className="flex items-center">
            <MobileMenu categories={categories} brandName={brand.name} />
            <span className="hidden lg:block">&nbsp;</span>
          </div>

          {/* Center: wordmark */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 text-center"
            aria-label={`${brand.name} — home`}
          >
            <span className="font-serif text-[22px] font-medium uppercase tracking-[0.28em] text-foreground lg:text-[28px]">
              {brand.name}
            </span>
          </Link>

          {/* Right: icons */}
          <HeaderIcons />
        </div>
      </div>
      <div className="border-t border-border/60">
        <CategoryBar categories={categories} />
      </div>
    </header>
  );
}
