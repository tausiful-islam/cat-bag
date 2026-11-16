import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Maison Noor — Premium Women's Handbags in Bangladesh",
    template: "%s — Maison Noor",
  },
  description:
    "A curated collection of premium women's handbags. Quiet luxury, considered design and a thoughtful price — delivered across Bangladesh.",
  openGraph: {
    type: "website",
    siteName: "Maison Noor",
    title: "Maison Noor — Premium Women's Handbags",
    description: "A curated collection of premium women's handbags in Bangladesh.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf7f1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="font-sans">
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
