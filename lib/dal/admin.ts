import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { publicUrl, STORAGE_BUCKETS, validateImageFile } from "@/lib/storage";
import type {
  AdminActivityLogRow,
  AdminUserRow,
  CategoryRow,
  InventoryMovementRow,
  ProductImageRow,
  ProductRow,
  ProductVariantRow,
} from "@/lib/types";

/**
 * Admin Data Access — products, categories, inventory, customers,
 * admins, activity. Every exported mutation assumes the caller has
 * ALREADY enforced permissions via requireAdmin(permission).
 */

// ---------- Activity log ----------

export async function logActivity(opts: {
  adminId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  const supabase = getSupabaseAdminClient();
  await supabase.from("admin_activity_logs").insert({
    admin_user_id: opts.adminId,
    action: opts.action,
    entity_type: opts.entityType ?? null,
    entity_id: opts.entityId ?? null,
    details: opts.details ?? null,
  });
}

export async function listActivity(limit = 100): Promise<(AdminActivityLogRow & { admin_name: string | null })[]> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("admin_activity_logs")
    .select("*, admin_users(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => ({
    ...(r as AdminActivityLogRow),
    admin_name: (r as { admin_users?: { name: string | null } }).admin_users?.name ?? null,
  }));
}

// ---------- Admin users ----------

export async function listAdmins(): Promise<AdminUserRow[]> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from("admin_users").select("*").order("created_at");
  return (data ?? []) as AdminUserRow[];
}

export async function getAdminByEmail(email: string): Promise<AdminUserRow | null> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from("admin_users").select("*").eq("email", email.toLowerCase()).single();
  return (data as AdminUserRow) ?? null;
}

export async function upsertAdmin(opts: {
  id?: string;
  email: string;
  name: string;
  role: AdminUserRow["role"];
  isActive: boolean;
}): Promise<AdminUserRow> {
  const supabase = getSupabaseAdminClient();
  const payload = {
    email: opts.email.toLowerCase(),
    name: opts.name,
    role: opts.role,
    is_active: opts.isActive,
  };
  const { data, error } = opts.id
    ? await supabase.from("admin_users").update(payload).eq("id", opts.id).select().single()
    : await supabase.from("admin_users").insert(payload).select().single();
  if (error) throw new Error(error.message);
  return data as AdminUserRow;
}

export async function countOwners(excludeId?: string): Promise<number> {
  const supabase = getSupabaseAdminClient();
  let query = supabase.from("admin_users").select("id", { count: "exact", head: true }).eq("role", "owner").eq("is_active", true);
  if (excludeId) query = query.neq("id", excludeId);
  const { count } = await query;
  return count ?? 0;
}

export async function touchAdminLogin(adminId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  await supabase.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("id", adminId);
}

// ---------- Products (admin) ----------

export interface ProductWriteInput {
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  price: number;
  sale_price: number | null;
  material: string | null;
  dim_l_cm: number | null;
  dim_w_cm: number | null;
  dim_h_cm: number | null;
  is_new: boolean;
  is_featured: boolean;
  status: ProductRow["status"];
  category_ids: string[];
}

export async function adminListProducts(search?: string, status?: string) {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("products")
    .select(`
      *,
      product_variants(*),
      product_images(*),
      product_categories(categories(id, name))
    `)
    .order("updated_at", { ascending: false })
    .limit(300);
  if (status && status !== "all") query = query.eq("status", status);
  if (search) {
    const s = search.trim().replace(/[%_]/g, "");
    if (s) query = query.or(`name.ilike.%${s}%,sku.ilike.%${s}%`);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((p) => {
    const variants = (p.product_variants ?? []) as ProductVariantRow[];
    const images = [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order) as ProductImageRow[];
    return {
      ...(p as ProductRow),
      stock: variants.filter((v) => v.is_active).reduce((s, v) => s + v.stock, 0),
      variant_count: variants.length,
      thumbnail: images[0] ? publicUrl(STORAGE_BUCKETS.products, images[0].storage_path) : null,
      categories: (p.product_categories ?? []).map((pc: { categories: { id: string; name: string } }) => pc.categories).filter(Boolean),
    };
  });
}

export async function adminGetProduct(id: string) {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("products")
    .select(`
      *,
      product_variants(*),
      product_images(*),
      product_categories(categories(id, slug, name))
    `)
    .eq("id", id)
    .single();
  if (!data) return null;
  return {
    ...(data as ProductRow),
    variants: (data.product_variants ?? []) as ProductVariantRow[],
    images: [...(data.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({ ...img, url: publicUrl(STORAGE_BUCKETS.products, img.storage_path) })),
    category_ids: (data.product_categories ?? []).map((pc: { categories?: { id?: string } }) => pc.categories?.id).filter(Boolean),
  };
}

export async function createProduct(input: ProductWriteInput): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      sku: input.sku,
      price: input.price,
      sale_price: input.sale_price,
      material: input.material,
      dim_l_cm: input.dim_l_cm,
      dim_w_cm: input.dim_w_cm,
      dim_h_cm: input.dim_h_cm,
      is_new: input.is_new,
      is_featured: input.is_featured,
      status: input.status,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  if (input.category_ids.length) {
    await supabase.from("product_categories").insert(
      input.category_ids.map((cid) => ({ product_id: data.id, category_id: cid })),
    );
  }
  return data.id;
}

export async function updateProduct(id: string, input: ProductWriteInput): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("products").update({
    name: input.name,
    slug: input.slug,
    description: input.description,
    sku: input.sku,
    price: input.price,
    sale_price: input.sale_price,
    material: input.material,
    dim_l_cm: input.dim_l_cm,
    dim_w_cm: input.dim_w_cm,
    dim_h_cm: input.dim_h_cm,
    is_new: input.is_new,
    is_featured: input.is_featured,
    status: input.status,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw new Error(error.message);
  await supabase.from("product_categories").delete().eq("product_id", id);
  if (input.category_ids.length) {
    await supabase.from("product_categories").insert(
      input.category_ids.map((cid) => ({ product_id: id, category_id: cid })),
    );
  }
}

export async function uploadProductImage(opts: {
  productId: string;
  file: File;
  alt?: string;
  sortOrder: number;
}): Promise<ProductImageRow> {
  const invalid = validateImageFile(opts.file);
  if (invalid) throw new Error(invalid);
  const supabase = getSupabaseAdminClient();
  const ext = opts.file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${opts.productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buf = Buffer.from(await opts.file.arrayBuffer());
  const { error: upErr } = await supabase.storage
    .from(STORAGE_BUCKETS.products)
    .upload(path, buf, { contentType: opts.file.type, upsert: false });
  if (upErr) throw new Error(upErr.message);
  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: opts.productId,
      storage_path: path,
      alt: opts.alt ?? opts.file.name.replace(/\.[^.]+$/, ""),
      sort_order: opts.sortOrder,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ProductImageRow;
}

export async function deleteProductImage(imageId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from("product_images").select("storage_path").eq("id", imageId).single();
  if (data) {
    await supabase.storage.from(STORAGE_BUCKETS.products).remove([data.storage_path]);
    await supabase.from("product_images").delete().eq("id", imageId);
  }
}

export async function reorderProductImages(productId: string, orderedIds: string[]): Promise<void> {
  const supabase = getSupabaseAdminClient();
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase.from("product_images").update({ sort_order: i }).eq("id", orderedIds[i]).eq("product_id", productId);
  }
}

export async function uploadBrandImage(file: File, area: string): Promise<string> {
  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);
  const supabase = getSupabaseAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${area}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.brand)
    .upload(path, buf, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

// ---------- Variants & inventory ----------

export async function upsertVariant(opts: {
  id?: string;
  productId: string;
  colourName: string;
  colourHex: string;
  sku: string;
  isActive: boolean;
}): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const payload = {
    product_id: opts.productId,
    colour_name: opts.colourName,
    colour_hex: opts.colourHex,
    sku: opts.sku,
    is_active: opts.isActive,
  };
  const { data, error } = opts.id
    ? await supabase.from("product_variants").update(payload).eq("id", opts.id).select("id").single()
    : await supabase.from("product_variants").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function deleteVariant(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("product_variants").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function adjustStock(opts: {
  variantId: string;
  delta: number;
  reason: "restock" | "adjustment";
  note: string | null;
  adminId: string;
}): Promise<void> {
  const supabase = getSupabaseAdminClient();
  // Atomic guarded update + movement log in one transaction
  const { data: ok, error } = await supabase.rpc("adjust_variant_stock", {
    p_variant_id: opts.variantId,
    p_delta: opts.delta,
    p_reason: opts.reason,
    p_note: opts.note,
    p_admin_id: opts.adminId,
  });
  if (error) throw new Error(error.message);
  if (ok !== true) throw new Error("Stock adjustment would go below zero.");
}

export async function getInventoryOverview(): Promise<
  { product_id: string; product_name: string; slug: string; sku: string; status: string; variants: (ProductVariantRow & { product_name?: string })[]; total_stock: number }[]
> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, sku, status, product_variants(*)")
    .neq("status", "archived")
    .order("name");
  return (data ?? []).map((p) => {
    const variants = (p.product_variants ?? []) as ProductVariantRow[];
    return {
      product_id: p.id,
      product_name: p.name,
      slug: p.slug,
      sku: p.sku,
      status: p.status,
      variants,
      total_stock: variants.reduce((s, v) => s + v.stock, 0),
    };
  });
}

export async function getStockMovements(productId?: string, limit = 100): Promise<(InventoryMovementRow & { product_name?: string; variant_name?: string; admin_name?: string })[]> {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("inventory_movements")
    .select(`
      *,
      products(name),
      product_variants(colour_name),
      admin_users(name)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (productId) query = query.eq("product_id", productId);
  const { data } = await query;
  return (data ?? []).map((m) => ({
    ...(m as InventoryMovementRow),
    product_name: (m as { products?: { name?: string } }).products?.name,
    variant_name: (m as { product_variants?: { colour_name?: string } }).product_variants?.colour_name,
    admin_name: (m as { admin_users?: { name?: string } }).admin_users?.name,
  }));
}

// ---------- Categories (admin) ----------

export async function adminListCategories(): Promise<(CategoryRow & { product_count: number })[]> {
  const supabase = getSupabaseAdminClient();
  const { data: cats } = await supabase.from("categories").select("*").order("sort_order");
  const { data: links } = await supabase.from("product_categories").select("category_id, product:products!inner(id, status)");
  const counts = new Map<string, number>();
  for (const l of links ?? []) {
    if ((l as { product?: { status?: string } }).product?.status === "active") {
      counts.set(l.category_id, (counts.get(l.category_id) ?? 0) + 1);
    }
  }
  return (cats ?? []).map((c) => ({ ...c, product_count: counts.get(c.id) ?? 0 }));
}

export async function upsertCategory(opts: {
  id?: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  showInNav: boolean;
  isActive: boolean;
  imagePath?: string | null;
}): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const payload: Record<string, unknown> = {
    slug: opts.slug,
    name: opts.name,
    description: opts.description,
    sort_order: opts.sortOrder,
    show_in_nav: opts.showInNav,
    is_active: opts.isActive,
  };
  if (opts.imagePath !== undefined) payload.image_path = opts.imagePath;
  const { error } = opts.id
    ? await supabase.from("categories").update(payload).eq("id", opts.id)
    : await supabase.from("categories").insert(payload);
  if (error) throw new Error(error.message);
}

export async function reorderCategories(orderedIds: string[]): Promise<void> {
  const supabase = getSupabaseAdminClient();
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase.from("categories").update({ sort_order: i + 1 }).eq("id", orderedIds[i]);
  }
}

// ---------- Customers (admin) ----------

export async function adminListCustomers(search?: string) {
  const supabase = getSupabaseAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("customer_phone, customer_name, total, status, created_at");
  const agg = new Map<string, { name: string; orders: number; value: number; last_order: string }>();
  for (const o of orders ?? []) {
    const cur = agg.get(o.customer_phone) ?? {
      name: o.customer_name, orders: 0, value: 0, last_order: o.created_at,
    };
    cur.orders++;
    if (o.status !== "cancelled") cur.value += Number(o.total);
    if (o.created_at > cur.last_order) {
      cur.last_order = o.created_at;
      cur.name = o.customer_name;
    }
    agg.set(o.customer_phone, cur);
  }
  let list = [...agg.entries()].map(([phone, v]) => ({ phone, ...v }));
  if (search) {
    const s = search.toLowerCase();
    list = list.filter((c) => c.phone.includes(s) || c.name.toLowerCase().includes(s));
  }
  return list.sort((a, b) => b.orders - a.orders);
}

export async function getCustomerOrders(phone: string) {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false });
  return (data ?? []) as import("@/lib/types").OrderRow[];
}

export async function getDeliveryZones() {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from("delivery_zones").select("*").order("district");
  return data ?? [];
}

export async function updateDeliveryZone(id: string, charge: number, etaNote: string | null, isActive: boolean): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("delivery_zones").update({
    charge, eta_note: etaNote, is_active: isActive, updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw new Error(error.message);
}
