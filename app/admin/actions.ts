"use server";

import { revalidatePath } from "next/cache";
import {
  adjustStock,
  createProduct,
  deleteProductImage,
  deleteVariant,
  logActivity,
  reorderCategories,
  reorderProductImages,
  updateDeliveryZone,
  updateProduct,
  uploadBrandImage,
  uploadProductImage,
  upsertAdmin,
  upsertCategory,
  upsertVariant,
  countOwners,
} from "@/lib/dal/admin";
import { saveSettings } from "@/lib/dal/settings";
import { updateOrderDelivery, updateOrderStatus } from "@/lib/dal/orders";
import { requireAdmin } from "@/lib/auth/current-admin";
import {
  categoryInputSchema,
  productInputSchema,
  stockAdjustSchema,
  variantInputSchema,
  adminUserSchema,
} from "@/lib/validation/schemas";
import type { OrderStatus } from "@/lib/types";

export interface ActionResult {
  ok?: boolean;
  error?: string;
}

function fail(err: unknown): ActionResult {
  if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
    return { error: "You do not have permission to perform this action." };
  }
  console.error("admin_action_error", err);
  return { error: err instanceof Error ? err.message : "Something went wrong." };
}

function num(fd: FormData, key: string): number | null {
  const v = fd.get(key);
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  return typeof v === "string" && v !== "" ? v : null;
}

// ---------- Products ----------

export async function saveProductAction(
  _prev: ActionResult,
  fd: FormData,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin("products.write");
    const id = str(fd, "id") ?? undefined;
    const parsed = productInputSchema.safeParse({
      id,
      name: fd.get("name"),
      slug: fd.get("slug"),
      description: fd.get("description") ?? "",
      sku: fd.get("sku"),
      price: num(fd, "price"),
      sale_price: num(fd, "sale_price"),
      material: fd.get("material") ?? "",
      dim_l_cm: num(fd, "dim_l_cm"),
      dim_w_cm: num(fd, "dim_w_cm"),
      dim_h_cm: num(fd, "dim_h_cm"),
      is_new: fd.get("is_new") === "on" || fd.get("is_new") === "true",
      is_featured: fd.get("is_featured") === "on" || fd.get("is_featured") === "true",
      status: fd.get("status"),
      category_ids: fd.getAll("category_ids").filter((v): v is string => typeof v === "string"),
    });
    if (!parsed.success) {
      return { error: parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join(" · ") };
    }
    const input = {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      sku: parsed.data.sku,
      price: parsed.data.price,
      sale_price: parsed.data.sale_price ?? null,
      material: parsed.data.material || null,
      dim_l_cm: parsed.data.dim_l_cm ?? null,
      dim_w_cm: parsed.data.dim_w_cm ?? null,
      dim_h_cm: parsed.data.dim_h_cm ?? null,
      is_new: parsed.data.is_new,
      is_featured: parsed.data.is_featured,
      status: parsed.data.status,
      category_ids: parsed.data.category_ids,
    };
    let productId = id;
    if (id) {
      await updateProduct(id, input);
    } else {
      productId = await createProduct(input);
    }
    await logActivity({
      adminId: admin.id,
      action: id ? "product.updated" : "product.created",
      entityType: "product",
      entityId: productId,
      details: { name: input.name, sku: input.sku },
    });
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function uploadProductImageAction(fd: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin("products.write");
    const productId = str(fd, "product_id");
    const file = fd.get("file");
    if (!productId) return { error: "Missing product." };
    if (!(file instanceof File) || file.size === 0) return { error: "Choose an image file." };
    const count = num(fd, "sort_order") ?? 99;
    const img = await uploadProductImage({
      productId,
      file,
      alt: str(fd, "alt") ?? undefined,
      sortOrder: count,
    });
    await logActivity({
      adminId: admin.id,
      action: "product.image_uploaded",
      entityType: "product",
      entityId: productId,
      details: { path: img.storage_path },
    });
    revalidatePath(`/admin/products/${productId}`);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteProductImageAction(fd: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin("products.write");
    const imageId = str(fd, "image_id");
    const productId = str(fd, "product_id");
    if (!imageId) return { error: "Missing image." };
    await deleteProductImage(imageId);
    await logActivity({
      adminId: admin.id,
      action: "product.image_deleted",
      entityType: "product",
      entityId: productId ?? undefined,
      details: { image_id: imageId },
    });
    if (productId) revalidatePath(`/admin/products/${productId}`);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function reorderProductImagesAction(fd: FormData): Promise<ActionResult> {
  try {
    await requireAdmin("products.write");
    const productId = str(fd, "product_id");
    const order = str(fd, "order");
    if (!productId || !order) return { error: "Missing data." };
    const ids = order.split(",").filter(Boolean);
    await reorderProductImages(productId, ids);
    revalidatePath(`/admin/products/${productId}`);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ---------- Variants ----------

export async function saveVariantAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin("products.write");
    const productId = str(fd, "product_id");
    if (!productId) return { error: "Missing product." };
    const parsed = variantInputSchema.safeParse({
      id: str(fd, "id") ?? undefined,
      colour_name: fd.get("colour_name"),
      colour_hex: fd.get("colour_hex"),
      sku: fd.get("sku"),
      is_active: fd.get("is_active") === "on" || fd.get("is_active") === "true",
    });
    if (!parsed.success) {
      return { error: parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join(" · ") };
    }
    await upsertVariant({
      id: parsed.data.id,
      productId,
      colourName: parsed.data.colour_name,
      colourHex: parsed.data.colour_hex,
      sku: parsed.data.sku,
      isActive: parsed.data.is_active,
    });
    await logActivity({
      adminId: admin.id,
      action: parsed.data.id ? "variant.updated" : "variant.created",
      entityType: "product",
      entityId: productId,
      details: { colour: parsed.data.colour_name },
    });
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/admin/inventory`);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteVariantAction(fd: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin("products.write");
    const id = str(fd, "id");
    const productId = str(fd, "product_id");
    if (!id) return { error: "Missing variant." };
    await deleteVariant(id);
    await logActivity({
      adminId: admin.id,
      action: "variant.deleted",
      entityType: "product",
      entityId: productId ?? undefined,
      details: { variant_id: id },
    });
    if (productId) revalidatePath(`/admin/products/${productId}`);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ---------- Inventory ----------

export async function adjustStockAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin("inventory.write");
    const parsed = stockAdjustSchema.safeParse({
      variant_id: fd.get("variant_id"),
      delta: num(fd, "delta"),
      reason: fd.get("reason"),
      note: fd.get("note") ?? "",
    });
    if (!parsed.success) {
      return { error: parsed.error.issues.map((i) => i.message).join(" · ") };
    }
    await adjustStock({
      variantId: parsed.data.variant_id,
      delta: parsed.data.delta,
      reason: parsed.data.reason,
      note: parsed.data.note || null,
      adminId: admin.id,
    });
    await logActivity({
      adminId: admin.id,
      action: "inventory.adjusted",
      entityType: "variant",
      entityId: parsed.data.variant_id,
      details: { delta: parsed.data.delta, reason: parsed.data.reason },
    });
    revalidatePath("/admin/inventory");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ---------- Orders ----------

export async function updateOrderStatusAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin("orders.write");
    const orderId = str(fd, "order_id");
    const to = str(fd, "to") as OrderStatus | null;
    if (!orderId || !to) return { error: "Missing order or status." };
    await updateOrderStatus({ orderId, to, adminId: admin.id, note: str(fd, "note") ?? undefined });
    await logActivity({
      adminId: admin.id,
      action: "order.status_changed",
      entityType: "order",
      entityId: orderId,
      details: { to },
    });
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function updateOrderDeliveryAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin("orders.write");
    const orderId = str(fd, "order_id");
    if (!orderId) return { error: "Missing order." };
    await updateOrderDelivery(orderId, {
      customer_name: str(fd, "customer_name") ?? undefined,
      customer_phone: str(fd, "customer_phone") ?? undefined,
      address_line: str(fd, "address_line") ?? undefined,
      district: str(fd, "district") ?? undefined,
      area: str(fd, "area"),
      instructions: str(fd, "instructions"),
    });
    await logActivity({ adminId: admin.id, action: "order.delivery_updated", entityType: "order", entityId: orderId });
    revalidatePath(`/admin/orders/${orderId}`);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ---------- Categories ----------

export async function saveCategoryAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin("categories.write");
    const image = fd.get("image");
    let imagePath: string | undefined;
    if (image instanceof File && image.size > 0) {
      imagePath = await uploadBrandImage(image, "categories");
    }
    const parsed = categoryInputSchema.safeParse({
      id: str(fd, "id") ?? undefined,
      slug: fd.get("slug"),
      name: fd.get("name"),
      description: fd.get("description") ?? "",
      sort_order: num(fd, "sort_order") ?? 0,
      show_in_nav: fd.get("show_in_nav") === "on" || fd.get("show_in_nav") === "true",
      is_active: fd.get("is_active") === "on" || fd.get("is_active") === "true",
    });
    if (!parsed.success) {
      return { error: parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join(" · ") };
    }
    await upsertCategory({
      id: parsed.data.id,
      slug: parsed.data.slug,
      name: parsed.data.name,
      description: parsed.data.description || null,
      sortOrder: parsed.data.sort_order,
      showInNav: parsed.data.show_in_nav,
      isActive: parsed.data.is_active,
      imagePath,
    });
    await logActivity({
      adminId: admin.id,
      action: parsed.data.id ? "category.updated" : "category.created",
      entityType: "category",
      entityId: parsed.data.id,
      details: { name: parsed.data.name },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function reorderCategoriesAction(fd: FormData): Promise<ActionResult> {
  try {
    await requireAdmin("categories.write");
    const order = str(fd, "order");
    if (!order) return { error: "Missing order." };
    await reorderCategories(order.split(",").filter(Boolean));
    revalidatePath("/admin/categories");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ---------- Settings / CMS ----------

export async function saveSettingsAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin(fd.get("area") === "content" ? "content.write" : "settings.write");
    const key = str(fd, "key");
    const raw = str(fd, "value");
    if (!key || !raw) return { error: "Missing settings data." };

    let value: unknown;
    try {
      value = JSON.parse(raw);
    } catch {
      return { error: "Invalid settings payload." };
    }

    // Handle image uploads for hero/category areas
    const heroImage = fd.get("hero_image");
    if (heroImage instanceof File && heroImage.size > 0 && (key === "homepage" || key === "brand")) {
      const path = await uploadBrandImage(heroImage, key === "homepage" ? "hero" : "brand");
      if (key === "homepage" && typeof value === "object" && value !== null) {
        (value as Record<string, unknown>).hero = {
          ...((value as Record<string, unknown>).hero as object),
          image_path: path,
        };
      } else if (key === "brand" && typeof value === "object" && value !== null) {
        (value as Record<string, unknown>).logo_path = path;
      }
    }

    await saveSettings(key, value, admin.id);
    await logActivity({ adminId: admin.id, action: "settings.saved", entityType: "settings", entityId: key });
    revalidatePath("/admin/settings");
    revalidatePath("/admin/content");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function saveDeliveryZoneAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin("settings.write");
    const id = str(fd, "zone_id");
    const charge = num(fd, "charge");
    if (!id || charge == null || charge < 0) return { error: "Enter a valid charge." };
    await updateDeliveryZone(id, charge, str(fd, "eta_note"), fd.get("is_active") === "on");
    await logActivity({ adminId: admin.id, action: "settings.delivery_zone_updated", entityType: "delivery_zone", entityId: id, details: { charge } });
    revalidatePath("/admin/settings/delivery");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ---------- Admin users ----------

export async function saveAdminUserAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin("admins.write");
    const parsed = adminUserSchema.safeParse({
      id: str(fd, "id") ?? undefined,
      email: fd.get("email"),
      name: fd.get("name"),
      role: fd.get("role"),
      is_active: fd.get("is_active") === "on",
    });
    if (!parsed.success) {
      return { error: parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join(" · ") };
    }
    // An owner cannot be demoted if they are the last one
    if (parsed.data.id) {
      const current = await import("@/lib/dal/admin").then((m) => m.listAdmins());
      const target = current.find((a) => a.id === parsed.data.id);
      if (target?.role === "owner" && parsed.data.role !== "owner") {
        const others = await countOwners(parsed.data.id);
        if (others === 0) return { error: "Cannot demote the last owner." };
      }
      if (target?.id === admin.id && parsed.data.role !== "owner" && admin.role === "owner") {
        const others = await countOwners(admin.id);
        if (others === 0) return { error: "You are the last owner — promote someone else first." };
      }
    }
    const saved = await upsertAdmin({
      id: parsed.data.id,
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role,
      isActive: parsed.data.is_active,
    });
    await logActivity({ adminId: admin.id, action: parsed.data.id ? "admin.updated" : "admin.created", entityType: "admin_user", entityId: saved.id, details: { email: saved.email, role: saved.role } });
    revalidatePath("/admin/admins");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}
