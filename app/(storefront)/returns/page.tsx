import type { Metadata } from "next";
import { LegalPage } from "@/components/storefront/legal-page";
import { getWhatsAppSettings } from "@/lib/dal/settings";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Returns & Exchange",
  alternates: { canonical: "/returns" },
};

export default async function ReturnsPage() {
  const whatsapp = await getWhatsAppSettings();
  return (
    <LegalPage title="Returns & Exchange" updated="17 November 2025">
      <p>
        We want you to love what you receive. If a product arrives damaged or does not
        match what you ordered, contact us as soon as possible after delivery and we will
        work with you to make it right.
      </p>
      <h2 className="pt-2 font-serif text-xl text-foreground">How to reach us</h2>
      <p>
        The fastest way to reach the team is WhatsApp
        {whatsapp.number ? (
          <>
            {" "}—{" "}
            <a
              href={whatsappLink(whatsapp.number, "Hello! I'd like to ask about a return or exchange.")}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              message us
            </a>
          </>
        ) : (
          " (contact details are listed in the website footer once configured)"
        )}
        . Please have your order reference ready.
      </p>
      <p className="rounded border border-border bg-[var(--sand)]/60 p-4 text-xs">
        Note: the store owner should finalize the exact return window and exchange
        conditions before launch. No return promises should be advertised until decided.
      </p>
    </LegalPage>
  );
}
