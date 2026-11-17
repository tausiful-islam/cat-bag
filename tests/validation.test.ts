import { describe, expect, it } from "vitest";
import { checkoutSchema, productInputSchema, stockAdjustSchema } from "@/lib/validation/schemas";

describe("checkoutSchema", () => {
  const base = {
    customer_name: "Test Customer",
    customer_phone: "01712345678",
    address_line: "12 Test Road, Banani",
    district: "Dhaka",
    items: [{ variant_id: "123e4567-e89b-42d3-a456-426614174000", quantity: 2 }],
    idempotency_key: "abcdefgh1234",
  };

  it("accepts a valid order", () => {
    const r = checkoutSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("normalizes +880 phone numbers", () => {
    const r = checkoutSchema.safeParse({ ...base, customer_phone: "+880 1712-345678" });
    expect(r.success).toBe(true);
  });

  it("rejects invalid phones", () => {
    const r = checkoutSchema.safeParse({ ...base, customer_phone: "02112345678" });
    expect(r.success).toBe(false);
  });

  it("rejects empty bags", () => {
    const r = checkoutSchema.safeParse({ ...base, items: [] });
    expect(r.success).toBe(false);
  });

  it("rejects out-of-range quantities", () => {
    const r = checkoutSchema.safeParse({
      ...base,
      items: [{ variant_id: "123e4567-e89b-42d3-a456-426614174000", quantity: 11 }],
    });
    expect(r.success).toBe(false);
  });

  it("requires a real idempotency key", () => {
    const r = checkoutSchema.safeParse({ ...base, idempotency_key: "short" });
    expect(r.success).toBe(false);
  });
});

describe("productInputSchema", () => {
  const base = {
    name: "Aria Crossbody",
    slug: "aria-crossbody",
    sku: "CB-ARIA",
    price: 6900,
    sale_price: null,
    is_new: true,
    is_featured: false,
    status: "active",
    category_ids: [],
  };

  it("accepts a valid product", () => {
    expect(productInputSchema.safeParse(base).success).toBe(true);
  });

  it("rejects bad slugs", () => {
    expect(productInputSchema.safeParse({ ...base, slug: "Not A Slug!" }).success).toBe(false);
  });

  it("rejects unknown statuses", () => {
    expect(productInputSchema.safeParse({ ...base, status: "removed" }).success).toBe(false);
  });

  it("accepts dimensions and material", () => {
    const r = productInputSchema.safeParse({
      ...base,
      material: "Coated canvas",
      dim_l_cm: 22,
      dim_w_cm: 7,
      dim_h_cm: 15,
    });
    expect(r.success).toBe(true);
  });
});

describe("stockAdjustSchema", () => {
  it("accepts restocks and adjustments", () => {
    expect(
      stockAdjustSchema.safeParse({ variant_id: "123e4567-e89b-42d3-a456-426614174000", delta: 10, reason: "restock" }).success,
    ).toBe(true);
    expect(
      stockAdjustSchema.safeParse({ variant_id: "123e4567-e89b-42d3-a456-426614174000", delta: -3, reason: "adjustment", note: "audit fix" }).success,
    ).toBe(true);
  });
  it("rejects zero deltas", () => {
    expect(
      stockAdjustSchema.safeParse({ variant_id: "123e4567-e89b-42d3-a456-426614174000", delta: 0, reason: "restock" }).success,
    ).toBe(false);
  });
});
