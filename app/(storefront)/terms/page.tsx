import type { Metadata } from "next";
import { LegalPage } from "@/components/storefront/legal-page";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated="17 November 2025">
      <p>
        By using this website and placing an order you agree to the terms below. They exist
        to keep the shopping experience clear and fair for both you and the store.
      </p>
      <h2 className="pt-2 font-serif text-xl text-foreground">Orders</h2>
      <p>
        Placing an order creates a request to purchase. Each order is reviewed by our team
        and confirmed with you directly before dispatch. Prices are shown in Bangladeshi
        Taka and are confirmed at the time you place the order.
      </p>
      <h2 className="pt-2 font-serif text-xl text-foreground">Payment</h2>
      <p>
        This store does not process online payments. Payment arrangements are confirmed
        with you personally when your order is confirmed and delivered.
      </p>
      <h2 className="pt-2 font-serif text-xl text-foreground">Product information</h2>
      <p>
        We aim to present products accurately. Colours may appear slightly different on
        different screens. Availability is subject to stock at the time of confirmation.
      </p>
      <p className="rounded border border-border bg-[var(--sand)]/60 p-4 text-xs">
        Note: this template text is provided as a starting point and should be reviewed and
        finalized by the store owner before launch.
      </p>
    </LegalPage>
  );
}
