import Link from "next/link";
import { requireAdmin } from "@/lib/auth/current-admin";
import { getAnnouncementSettings, getHomepageSettings } from "@/lib/dal/settings";
import { adminListProducts } from "@/lib/dal/admin";
import { AnnouncementEditor, HomepageEditor } from "@/components/admin/homepage-editors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default async function ContentPage() {
  await requireAdmin("content.read");
  const [home, announcement, products] = await Promise.all([
    getHomepageSettings(),
    getAnnouncementSettings(),
    adminListProducts(undefined, "active"),
  ]);
  const featured = products.filter((p) => p.is_featured);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">Homepage CMS</h1>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="border-border bg-white">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-medium">Announcement Bar</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <AnnouncementEditor initial={announcement} />
          </CardContent>
        </Card>

        <Card className="border-border bg-white">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-medium">Featured &amp; New In Selection</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 text-[13px]">
            <p className="text-muted-foreground">
              Featured collection: <strong>{featured.length}</strong> of {products.length} active products.
            </p>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Choose which products appear in <em>Featured</em> and <em>New In</em> from each
              product&apos;s edit page — the &ldquo;Featured collection&rdquo; and &ldquo;Mark as
              New In&rdquo; switches.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {featured.slice(0, 8).map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}`}
                  className="rounded-full border border-border px-3 py-1 text-xs hover:border-[var(--gold)]"
                >
                  {p.name}
                </Link>
              ))}
              {featured.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No featured products yet — mark products as featured to fill this section.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-white">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm font-medium">Homepage Content</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <HomepageEditor initial={home} />
        </CardContent>
      </Card>
    </div>
  );
}
