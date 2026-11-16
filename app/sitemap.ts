import type { MetadataRoute } from "next";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await getSupabaseServerClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("status", "active").limit(1000),
    supabase.from("categories").select("slug").eq("is_active", true),
  ]);

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "daily", priority: 0.9 },
    ...(categories ?? []).map((c) => ({
      url: `${base}/collections/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...(products ?? []).map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${base}/privacy`, priority: 0.2 },
    { url: `${base}/terms`, priority: 0.2 },
    { url: `${base}/returns`, priority: 0.3 },
  ];
}
