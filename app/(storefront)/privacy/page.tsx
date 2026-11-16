import type { Metadata } from "next";
import { LegalPage } from "@/components/storefront/legal-page";
import { getBrandSettings } from "@/lib/dal/settings";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const brand = await getBrandSettings();
  return (
    <LegalPage title="Privacy Policy" updated="17 November 2025">
      <p>
        {brand.name} respects your privacy. This policy explains what information we collect
        when you use this website and how we use it.
      </p>
      <h2 className="pt-2 font-serif text-xl text-foreground">Information we collect</h2>
      <p>
        When you place an order we collect your name, contact number and delivery address —
        only what is required to deliver your order and contact you about it. We do not
        collect or store any payment card details, because this store does not process
        online payments.
      </p>
      <h2 className="pt-2 font-serif text-xl text-foreground">How we use it</h2>
      <p>
        We use your information to process and deliver orders, respond to enquiries (for
        example on WhatsApp), and improve the store. We do not sell your personal
        information to anyone.
      </p>
      <h2 className="pt-2 font-serif text-xl text-foreground">Your choices</h2>
      <p>
        You may request correction or deletion of your personal information by contacting
        us through the channels listed in the website footer.
      </p>
      <p className="rounded border border-border bg-[var(--sand)]/60 p-4 text-xs">
        Note: this template text is provided as a starting point and should be reviewed and
        finalized by the store owner before launch.
      </p>
    </LegalPage>
  );
}
