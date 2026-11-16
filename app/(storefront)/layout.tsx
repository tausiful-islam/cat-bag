import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { WhatsAppFloat } from "@/components/storefront/whatsapp-float";
import { BagProvider } from "@/components/storefront/bag-context";
import { WishlistProvider } from "@/components/storefront/wishlist-context";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <BagProvider>
      <WishlistProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <WhatsAppFloat />
        </div>
      </WishlistProvider>
    </BagProvider>
  );
}
