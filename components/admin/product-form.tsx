"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  deleteProductImageAction,
  reorderProductImagesAction,
  saveProductAction,
  saveVariantAction,
  deleteVariantAction,
  uploadProductImageAction,
  type ActionResult,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ProductFormValues {
  id?: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  price: string;
  sale_price: string;
  material: string;
  dim_l_cm: string;
  dim_w_cm: string;
  dim_h_cm: string;
  is_new: boolean;
  is_featured: boolean;
  status: string;
  category_ids: string[];
}

export interface ExistingImage {
  id: string;
  url: string;
  alt: string | null;
}

export interface ExistingVariant {
  id: string;
  colour_name: string;
  colour_hex: string;
  sku: string;
  stock: number;
  is_active: boolean;
}

export function ProductForm({
  initial,
  categories,
  images,
  variants,
}: {
  initial: ProductFormValues;
  categories: { id: string; name: string }[];
  images: ExistingImage[];
  variants: ExistingVariant[];
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(saveProductAction, {});
  const [values, setValues] = useState(initial);
  const [autoSlug, setAutoSlug] = useState(!initial.id);

  const set = (k: keyof ProductFormValues, v: string | boolean | string[]) =>
    setValues((p) => ({ ...p, [k]: v }));

  const onNameChange = (name: string) => {
    set("name", name);
    if (autoSlug) {
      set("slug", name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <div className="space-y-6">
        <section className="border border-border bg-white p-6">
          <h2 className="text-sm font-medium">Basics</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name" className="text-xs">Name *</Label>
              <Input id="name" name="name" required maxLength={160} value={values.name}
                onChange={(e) => onNameChange(e.target.value)} className="bg-white text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug" className="text-xs">URL slug *</Label>
              <Input id="slug" name="slug" required value={values.slug}
                onChange={(e) => { setAutoSlug(false); set("slug", e.target.value); }}
                className="bg-white font-mono text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sku" className="text-xs">SKU *</Label>
              <Input id="sku" name="sku" required maxLength={60} value={values.sku}
                onChange={(e) => set("sku", e.target.value.toUpperCase())} className="bg-white font-mono text-[13px]" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description" className="text-xs">Description</Label>
              <Textarea id="description" name="description" rows={5} maxLength={4000}
                value={values.description} onChange={(e) => set("description", e.target.value)}
                className="bg-white text-[13px]" />
            </div>
          </div>
        </section>

        <section className="border border-border bg-white p-6">
          <h2 className="text-sm font-medium">Pricing &amp; Details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs">Price (৳) *</Label>
              <Input id="price" name="price" type="number" min="0" step="1" required
                value={values.price} onChange={(e) => set("price", e.target.value)} className="bg-white text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sale_price" className="text-xs">Sale price (৳)</Label>
              <Input id="sale_price" name="sale_price" type="number" min="0" step="1"
                value={values.sale_price} onChange={(e) => set("sale_price", e.target.value)} className="bg-white text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="material" className="text-xs">Material</Label>
              <Input id="material" name="material" maxLength={120} placeholder="e.g. Grain leather"
                value={values.material} onChange={(e) => set("material", e.target.value)} className="bg-white text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dim_l" className="text-xs">Length (cm)</Label>
              <Input id="dim_l" name="dim_l_cm" type="number" min="0" step="0.1"
                value={values.dim_l_cm} onChange={(e) => set("dim_l_cm", e.target.value)} className="bg-white text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dim_w" className="text-xs">Width (cm)</Label>
              <Input id="dim_w" name="dim_w_cm" type="number" min="0" step="0.1"
                value={values.dim_w_cm} onChange={(e) => set("dim_w_cm", e.target.value)} className="bg-white text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dim_h" className="text-xs">Height (cm)</Label>
              <Input id="dim_h" name="dim_h_cm" type="number" min="0" step="0.1"
                value={values.dim_h_cm} onChange={(e) => set("dim_h_cm", e.target.value)} className="bg-white text-[13px]" />
            </div>
          </div>
        </section>

        {values.id && (
          <>
            <ImageManager productId={values.id} images={images} />
            <VariantManager productId={values.id} variants={variants} />
          </>
        )}
      </div>

      <aside className="space-y-6 xl:sticky xl:top-20 xl:self-start">
        <section className="border border-border bg-white p-6">
          <h2 className="text-sm font-medium">Publish</h2>
          <div className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <input type="hidden" name="status" value={values.status} />
              <Select value={values.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="bg-white text-[13px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_new" className="text-xs">Mark as New In</Label>
              <input type="hidden" name="is_new" value={String(values.is_new)} />
              <Switch id="is_new" checked={values.is_new} onCheckedChange={(v) => set("is_new", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_featured" className="text-xs">Featured collection</Label>
              <input type="hidden" name="is_featured" value={String(values.is_featured)} />
              <Switch id="is_featured" checked={values.is_featured} onCheckedChange={(v) => set("is_featured", v)} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Categories</Label>
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2.5 text-[13px]">
                  <input
                    type="checkbox"
                    name="category_ids"
                    value={c.id}
                    checked={values.category_ids.includes(c.id)}
                    onChange={(e) =>
                      set(
                        "category_ids",
                        e.target.checked
                          ? [...values.category_ids, c.id]
                          : values.category_ids.filter((x) => x !== c.id),
                      )
                    }
                    className="h-4 w-4 accent-[var(--espresso)]"
                  />
                  {c.name}
                </label>
              ))}
            </div>

            {state.error && <p className="text-xs text-destructive">{state.error}</p>}
            {state.ok && <p className="text-xs text-emerald-600">Saved.</p>}

            <Button type="submit" disabled={pending} className="w-full text-xs uppercase tracking-[0.14em]">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {values.id ? "Save Product" : "Create Product"}
            </Button>
            {!values.id && (
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Create the product first, then upload images and add colour variants.
              </p>
            )}
          </div>
        </section>
      </aside>
    </form>
  );
}

function ImageManager({ productId, images }: { productId: string; images: ExistingImage[] }) {
  const [uploading, setUploading] = useState(false);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.set("product_id", productId);
        fd.set("file", file);
        fd.set("sort_order", String(images.length + 90));
        const res = await uploadProductImageAction(fd);
        if (res.error) throw new Error(res.error);
      }
      toast.success("Image uploaded");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    const fd = new FormData();
    fd.set("image_id", id);
    fd.set("product_id", productId);
    const res = await deleteProductImageAction(fd);
    if (res.error) toast.error(res.error);
    else window.location.reload();
  }

  async function move(index: number, dir: -1 | 1) {
    const ids = images.map((i) => i.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    const fd = new FormData();
    fd.set("product_id", productId);
    fd.set("order", ids.join(","));
    await reorderProductImagesAction(fd);
    window.location.reload();
  }

  return (
    <section className="border border-border bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Photographs</h2>
        <label className="inline-flex cursor-pointer items-center gap-2 border border-border px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] hover:border-foreground/30">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={upload} />
        </label>
      </div>
      {images.length === 0 ? (
        <p className="mt-5 text-[13px] text-muted-foreground">
          No photographs yet. The first image becomes the product&apos;s main image.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          {images.map((img, i) => (
            <div key={img.id} className="group relative">
              <div className="img-frame relative aspect-[4/5]">
                <Image src={img.url} alt={img.alt ?? ""} fill sizes="160px" className="object-cover" />
              </div>
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 bg-background/90 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em]">
                  Main
                </span>
              )}
              <div className="absolute right-1.5 top-1.5 flex gap-1">
                <button type="button" onClick={() => move(i, -1)} aria-label="Move up"
                  className="rounded bg-background/90 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => move(i, 1)} aria-label="Move down"
                  className="rounded bg-background/90 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <ArrowDown className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => remove(img.id)} aria-label="Delete"
                  className="rounded bg-background/90 p-1 text-destructive opacity-0 transition-opacity group-hover:opacity-100">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function VariantManager({ productId, variants }: { productId: string; variants: ExistingVariant[] }) {
  const [rows, setRows] = useState(variants);
  const [newVariant, setNewVariant] = useState({ colour_name: "", colour_hex: "#1a1512", sku: "" });
  const [error, setError] = useState<string | null>(null);

  async function addVariant() {
    setError(null);
    if (!newVariant.colour_name.trim() || !newVariant.sku.trim()) {
      setError("Colour name and SKU are required.");
      return;
    }
    const fd = new FormData();
    fd.set("product_id", productId);
    fd.set("colour_name", newVariant.colour_name);
    fd.set("colour_hex", newVariant.colour_hex);
    fd.set("sku", newVariant.sku);
    fd.set("is_active", "true");
    // saveVariantAction is a useActionState-style action; call directly via form
    const res = await saveVariantAction({}, fd);
    if (res.error) setError(res.error);
    else window.location.reload();
  }

  async function removeVariant(id: string) {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("product_id", productId);
    const res = await deleteVariantAction(fd);
    if (res.error) toast.error(res.error);
    else window.location.reload();
  }

  return (
    <section className="border border-border bg-white p-6">
      <h2 className="text-sm font-medium">Colours &amp; Variants</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Stock is managed per variant. Manage quantities in Inventory.
      </p>

      <table className="mt-5 w-full text-[13px]">
        <thead>
          <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <th className="py-2 font-medium">Colour</th>
            <th className="py-2 font-medium">SKU</th>
            <th className="py-2 text-center font-medium">Stock</th>
            <th className="py-2 text-right font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={4} className="py-4 text-muted-foreground">No variants yet.</td></tr>
          ) : (
            rows.map((v) => (
              <tr key={v.id} className="border-b border-border/60">
                <td className="py-2.5">
                  <span className="mr-2 inline-block h-3.5 w-3.5 rounded-full border border-black/10 align-middle" style={{ backgroundColor: v.colour_hex }} />
                  {v.colour_name}
                </td>
                <td className="py-2.5 font-mono text-xs">{v.sku}</td>
                <td className="py-2.5 text-center">{v.stock}</td>
                <td className="py-2.5 text-right">
                  <button type="button" onClick={() => removeVariant(v.id)} className="text-destructive/70 hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
          <tr>
            <td className="py-2.5">
              <Input value={newVariant.colour_name} onChange={(e) => setNewVariant((p) => ({ ...p, colour_name: e.target.value }))}
                placeholder="e.g. Espresso" className="h-8 bg-white text-[13px]" />
            </td>
            <td className="py-2.5">
              <Input value={newVariant.sku} onChange={(e) => setNewVariant((p) => ({ ...p, sku: e.target.value.toUpperCase() }))}
                placeholder="SKU-BROWN" className="h-8 bg-white font-mono text-[13px]" />
            </td>
            <td className="py-2.5 text-center">
              <input type="color" value={newVariant.colour_hex} onChange={(e) => setNewVariant((p) => ({ ...p, colour_hex: e.target.value }))}
                aria-label="Colour swatch" className="h-8 w-10 cursor-pointer rounded border border-border bg-white p-0.5" />
            </td>
            <td className="py-2.5 text-right">
              <Button type="button" variant="outline" onClick={addVariant} className="h-8 text-xs">Add</Button>
            </td>
          </tr>
        </tbody>
      </table>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </section>
  );
}
