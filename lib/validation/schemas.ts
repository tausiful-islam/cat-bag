import { z } from "zod";

const banglaFriendlyText = (min: number, max: number) =>
  z.string().trim().min(min).max(max);

export const checkoutSchema = z.object({
  customer_name: banglaFriendlyText(2, 120),
  customer_phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[^\d+]/g, ""))
    .refine(
      (v) => {
        const d = v.replace(/^\+?880/, "0");
        return /^01[3-9]\d{8}$/.test(d);
      },
      { message: "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)" },
    ),
  address_line: banglaFriendlyText(8, 400),
  district: z.string().trim().min(2).max(60),
  area: z.string().trim().max(120).optional().or(z.literal("")),
  instructions: z.string().trim().max(600).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        variant_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1, "Your bag is empty")
    .max(40),
  idempotency_key: z.string().min(8).max(80),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const productInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9-]+$/, "Slug may contain lowercase letters, numbers and hyphens"),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  sku: z.string().trim().min(2).max(60).regex(/^[A-Za-z0-9._-]+$/, "SKU letters, numbers, . _ -"),
  price: z.number().min(0).max(10_000_000),
  sale_price: z.number().min(0).max(10_000_000).nullable(),
  material: z.string().trim().max(120).optional().or(z.literal("")),
  dim_l_cm: z.number().min(0).max(200).nullable(),
  dim_w_cm: z.number().min(0).max(200).nullable(),
  dim_h_cm: z.number().min(0).max(200).nullable(),
  is_new: z.boolean(),
  is_featured: z.boolean(),
  status: z.enum(["draft", "active", "inactive", "archived"]),
  category_ids: z.array(z.string().uuid()).max(10),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export const variantInputSchema = z.object({
  id: z.string().uuid().optional(),
  colour_name: z.string().trim().min(1).max(60),
  colour_hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  sku: z.string().trim().min(1).max(80),
  is_active: z.boolean(),
});

export const categoryInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(600).optional().or(z.literal("")),
  sort_order: z.number().int().min(0).max(999),
  show_in_nav: z.boolean(),
  is_active: z.boolean(),
});

export const stockAdjustSchema = z.object({
  variant_id: z.string().uuid(),
  delta: z.number().int().refine((v) => v !== 0, "Delta cannot be zero"),
  reason: z.enum(["restock", "adjustment"]),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});

export const adminSignInSchema = z.object({
  email: z.string().trim().email(),
  setup_token: z.string().min(10).max(200),
});

export const adminUserSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().trim().email(),
  name: z.string().trim().min(2).max(120),
  role: z.enum(["owner", "administrator", "order_manager", "catalog_manager", "content_manager"]),
  is_active: z.boolean(),
});
