import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/current-admin";
import { adminGetProduct, adminListCategories } from "@/lib/dal/admin";
import { ProductForm } from "@/components/admin/product-form";


export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("products.write");
  const { id } = await params;
  const [product, categories] = await Promise.all([
    adminGetProduct(id),
    adminListCategories(),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="rounded-md border border-border bg-white p-2 hover:border-foreground/30">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl">{product.name}</h1>
          <p className="text-[13px] text-muted-foreground">
            Edit product · <a href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">view on store ↗</a>
          </p>
        </div>
      </div>
      <ProductForm
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          sku: product.sku,
          price: String(product.price ?? ""),
          sale_price: product.sale_price != null ? String(product.sale_price) : "",
          material: product.material ?? "",
          dim_l_cm: product.dim_l_cm != null ? String(product.dim_l_cm) : "",
          dim_w_cm: product.dim_w_cm != null ? String(product.dim_w_cm) : "",
          dim_h_cm: product.dim_h_cm != null ? String(product.dim_h_cm) : "",
          is_new: product.is_new,
          is_featured: product.is_featured,
          status: product.status,
          category_ids: product.category_ids,
        }}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        images={product.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt }))}
        variants={product.variants.map((v) => ({
          id: v.id,
          colour_name: v.colour_name,
          colour_hex: v.colour_hex,
          sku: v.sku,
          stock: v.stock,
          is_active: v.is_active,
        }))}
      />
    </div>
  );
}
