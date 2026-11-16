import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Public endpoint for the guest wishlist: returns active product card
 * data for a list of product ids (max 100). RLS applies — only
 * active products are visible to the anon key.
 */
export async function GET(req: NextRequest) {
  const ids = (req.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[0-9a-f-]{36}$/i.test(s))
    .slice(0, 100);
  if (ids.length === 0) return NextResponse.json({ products: [] });

  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("id, slug, name, price, sale_price, is_new, product_images(storage_path, sort_order), product_variants(colour_name, colour_hex, is_active)")
    .eq("status", "active")
    .in("id", ids);

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const products = (data ?? []).map((p) => {
    const images = [...(p.product_images ?? [])].sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order);
    const seen = new Set<string>();
    const colours: { name: string; hex: string }[] = [];
    for (const v of (p.product_variants ?? []).filter((v: { is_active: boolean }) => v.is_active)) {
      if (!seen.has(v.colour_name)) {
        seen.add(v.colour_name);
        colours.push({ name: v.colour_name, hex: v.colour_hex });
      }
    }
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: Number(p.price),
      sale_price: p.sale_price != null ? Number(p.sale_price) : null,
      is_new: p.is_new,
      colours,
      image_url: images[0]
        ? `${base}/storage/v1/object/public/product-images/${encodeURI(images[0].storage_path)}`
        : null,
      hover_image_url: null,
    };
  });

  return NextResponse.json({ products });
}
