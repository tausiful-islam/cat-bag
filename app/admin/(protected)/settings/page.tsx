import Link from "next/link";
import { requireAdmin } from "@/lib/auth/current-admin";
import {
  getBrandSettings,
  getFeaturesSettings,
  getFooterSettings,
  getSocialSettings,
  getWhatsAppSettings,
} from "@/lib/dal/settings";
import {
  BrandEditor,
  ContactEditor,
  FeaturesEditor,
  FooterEditor,
} from "@/components/admin/settings-editors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default async function SettingsPage() {
  await requireAdmin("settings.read");
  const [brand, whatsapp, social, footer, features] = await Promise.all([
    getBrandSettings(),
    getWhatsAppSettings(),
    getSocialSettings(),
    getFooterSettings(),
    getFeaturesSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl">Settings</h1>
        <Link
          href="/admin/settings/delivery"
          className="border border-border bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] hover:border-foreground/30"
        >
          Delivery Charges →
        </Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="border-border bg-white">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-medium">Store Identity</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <BrandEditor initial={brand} />
          </CardContent>
        </Card>

        <Card className="border-border bg-white">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-medium">Contact &amp; Social</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <ContactEditor whatsappInitial={whatsapp} socialInitial={social} />
          </CardContent>
        </Card>

        <Card className="border-border bg-white">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-medium">Footer</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <FooterEditor initial={footer} />
          </CardContent>
        </Card>

        <Card className="border-border bg-white">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-medium">Features</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <FeaturesEditor initial={features} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
