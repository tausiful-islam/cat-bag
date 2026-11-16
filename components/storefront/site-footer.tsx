import Link from "next/link";
import { MessageCircle } from "lucide-react";
import {
  getBrandSettings,
  getFooterSettings,
  getSocialSettings,
  getWhatsAppSettings,
} from "@/lib/dal/settings";
import { getNavCategories } from "@/lib/dal/catalog";
import { whatsappLink } from "@/lib/whatsapp";

export async function SiteFooter() {
  const [brand, footer, social, whatsapp, categories] = await Promise.all([
    getBrandSettings(),
    getFooterSettings(),
    getSocialSettings(),
    getWhatsAppSettings(),
    getNavCategories(),
  ]);

  const socials = [
    { label: "Instagram", href: social.instagram },
    { label: "Facebook", href: social.facebook },
    { label: "TikTok", href: social.tiktok },
  ].filter((s) => s.href);

  return (
    <footer className="border-t border-border bg-[var(--sand)]/60">
      <div className="container-store grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4 lg:py-16">
        <div>
          <span className="font-serif text-xl font-medium uppercase tracking-[0.24em]">
            {brand.name}
          </span>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {footer.about || brand.description}
          </p>
          {socials.length > 0 && (
            <div className="mt-5 flex gap-5 text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="eyebrow">Shop</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li><Link href="/shop" className="hover:text-foreground">View All</Link></li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/collections/${c.slug}`} className="hover:text-foreground">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow">Customer Care</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {whatsapp.number ? (
              <li>
                <a
                  href={whatsappLink(whatsapp.number, whatsapp.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-foreground"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Us
                </a>
              </li>
            ) : null}
            <li><Link href="/returns" className="hover:text-foreground">Returns &amp; Exchange</Link></li>
            <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-foreground">Terms &amp; Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow">The Maison</h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{brand.tagline}</p>
          {footer.note && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{footer.note}</p>}
        </div>
      </div>

      <div className="border-t border-border/70 py-5">
        <p className="container-store text-center text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          © {new Date().getFullYear()} {brand.name} · Dhaka, Bangladesh
        </p>
      </div>
    </footer>
  );
}
