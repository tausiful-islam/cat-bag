import { requireAdmin } from "@/lib/auth/current-admin";
import { adminListCategories } from "@/lib/dal/admin";
import { ProductForm } from "@/components/admin/product-form";


export default async function NewProductPage() {
  await requireAdmin("products.write");
  const categories = await adminListCategories();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">New Product</h1>
      <ProductForm
        initial={{
          name: "",
          slug: "",
          description: "",
          sku: "",
          price: "",
          sale_price: "",
          material: "",
          dim_l_cm: "",
          dim_w_cm: "",
          dim_h_cm: "",
          is_new: true,
          is_featured: false,
          status: "draft",
          category_ids: [],
        }}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        images={[]}
        variants={[]}
      />
    </div>
  );
}
