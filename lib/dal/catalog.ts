import "server-only";
import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { publicUrl, STORAGE_BUCKETS } from "@/lib/storage";
import type {
  CategoryRow,
  ProductCardData,
  ProductDetailData,
  ProductImageRow,
  ProductRow,
  ProductVariantRow,
} from "@/lib/types";

export interface ListOptions {
  categorySlug?: string;
  priceMin?: number;
  priceMax?: number;
  colours?: string[];
  materials?: string[];
  inStockOnly?: boolean;
  sort?: "newest" | "price_asc" | "price_desc";
  limit?: number;
}

interface JoinedProduct extends ProductRow {
  product_images: ProductImageRow[];
  product_variants: ProductVariantRow[];
}

export function effectivePrice(p: { price: number; sale_price: number | null }): number {
  return p.sale_price != null ? Number(p.sale_price) : Number(p.price);
}

function toCard(p: JoinedProduct): ProductCardData {
  const images = [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const variants = (p.product_variants ?? []).filter((v) => v.is_active);
  const seen = new Set<string>();
  const colours: { name: string; hex: string }[] = [];
  for (const v of variants) {
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
    image_url: images[0] ? publicUrl(STORAGE_BUCKETS.products, images[0].storage_path) : null,
    hover_image_url: images[1] ? publicUrl(STORAGE_BUCKETS.products, images[1].storage_path) : null,
  };
}

/**
 * Public catalog listing with filtering/sorting.
 * The initial collection is intentionally small and curated, so facet
 * filtering (effective price, colour, material) is computed in JS from
 * an indexed base query. Swap to SQL facets when the catalog grows.
 */
export async function listProducts(opts: ListOptions = {}): Promise<{
  items: ProductCardData[];
  total: number;
  facets: { colours: string[]; materials: string[]; priceMin: number; priceMax: number };
}> {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("products")
    .select("*, product_images(*), product_variants(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(500);

  if (opts.categorySlug && opts.categorySlug !== "all") {
    if (opts.categorySlug === "new-in") {
      query = query.eq("is_new", true);
    } else {
      // Two-step fetch: PostgREST "in" needs literal UUID lists
      const { data: links } = await supabase
        .from("product_categories")
        .select("product_id, categories!inner(slug)")
        .eq("categories.slug", opts.categorySlug);
      const ids = (links ?? []).map((l: { product_id: string }) => l.product_id);
      if (ids.length === 0) return { items: [], total: 0, facets: { colours: [], materials: [], priceMin: 0, priceMax: 0 } };
      query = query.in("id", ids);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let rows = (data ?? []) as JoinedProduct[];

  // Facets computed over the category scope, before other filters
  const allColours = new Set<string>();
  const allMaterials = new Set<string>();
  let scopeMin = Infinity;
  let scopeMax = 0;
  for (const p of rows) {
    const price = effectivePrice(p);
    scopeMin = Math.min(scopeMin, price);
    scopeMax = Math.max(scopeMax, price);
    for (const v of (p.product_variants ?? []).filter((v) => v.is_active)) allColours.add(v.colour_name);
    if (p.material) allMaterials.add(p.material);
  }

  let cards = rows.map(toCard);

  if (opts.priceMin != null) cards = cards.filter((c) => effectivePrice(c) >= opts.priceMin!);
  if (opts.priceMax != null) cards = cards.filter((c) => effectivePrice(c) <= opts.priceMax!);
  if (opts.colours?.length) {
    const wanted = new Set(opts.colours);
    cards = cards.filter((c) => c.colours.some((col) => wanted.has(col.name)));
  }
  if (opts.materials?.length) {
    const wanted = new Set(opts.materials);
    cards = cards.filter((c) => {
      const mat = rows.find((r) => r.id === c.id)?.material;
      return mat != null && wanted.has(mat);
    });
  }
  if (opts.inStockOnly) {
    const stock = new Map(rows.map((r) => [r.id, r.product_variants.filter((v) => v.is_active).reduce((s, v) => s + v.stock, 0)]));
    cards = cards.filter((c) => (stock.get(c.id) ?? 0) > 0);
  }

  switch (opts.sort) {
    case "price_asc":
      cards.sort((a, b) => effectivePrice(a) - effectivePrice(b));
      break;
    case "price_desc":
      cards.sort((a, b) => effectivePrice(b) - effectivePrice(a));
      break;
    default:
      break; // newest (base order)
  }

  if (opts.limit) cards = cards.slice(0, opts.limit);

  return {
    items: cards,
    total: cards.length,
    facets: {
      colours: [...allColours].sort(),
      materials: [...allMaterials].sort(),
      priceMin: scopeMin === Infinity ? 0 : Math.floor(scopeMin),
      priceMax: Math.ceil(scopeMax),
    },
  };
}

export async function getNewArrivals(limit = 8): Promise<ProductCardData[]> {
  const { items } = await listProducts({ categorySlug: "new-in", limit });
  if (items.length > 0) return items;
  const { items: latest } = await listProducts({ limit });
  return latest;
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), product_variants(*)")
    .eq("status", "active")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(toCard);
}

export async function getProductBySlug(slug: string): Promise<ProductDetailData | null> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select(`
      *,
      product_images(*),
      product_variants(*),
      product_categories(categories(id, slug, name))
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single();
  if (!data) return null;

  const p = data as ProductDetailData & {
    product_categories: { categories: CategoryRow }[];
    product_images: ProductImageRow[];
    product_variants: ProductVariantRow[];
  };
  return {
    ...p,
    categories: p.product_categories.map((pc: { categories: CategoryRow }) => pc.categories).filter(Boolean),
    images: [...p.product_images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({ ...img, url: publicUrl(STORAGE_BUCKETS.products, img.storage_path) })),
    variants: p.product_variants.filter((v: ProductVariantRow) => v.is_active),
  };
}

export async function getRelatedProducts(
  productId: string,
  categorySlugs: string[],
  limit = 4,
): Promise<ProductCardData[]> {
  for (const slug of categorySlugs) {
    const { items } = await listProducts({ categorySlug: slug, limit: limit + 2 });
    const filtered = items.filter((i) => i.id !== productId);
    if (filtered.length >= 2) return filtered.slice(0, limit);
  }
  const { items } = await listProducts({ limit: limit + 2 });
  return items.filter((i) => i.id !== productId).slice(0, limit);
}

export async function searchProducts(term: string, limit = 20): Promise<ProductCardData[]> {
  const clean = term.trim().replace(/[%_]/g, "");
  if (clean.length < 2) return [];
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), product_variants(*)")
    .eq("status", "active")
    .ilike("name", `%${clean}%`)
    .limit(limit);
  return (data ?? []).map(toCard);
}

export const getNavCategories = cache(async (): Promise<CategoryRow[]> => {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .eq("show_in_nav", true)
    .order("sort_order");
  return data ?? [];
});

export const getCategoriesWithImages = cache(async (): Promise<(CategoryRow & { image_url: string | null; product_count: number })[]> => {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");
  return (data ?? []).map((c: CategoryRow) => ({
    ...c,
    image_url: c.image_path ? publicUrl(STORAGE_BUCKETS.brand, c.image_path) : null,
    product_count: count ?? 0,
  }));
});
