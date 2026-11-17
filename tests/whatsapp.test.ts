import { describe, expect, it } from "vitest";
import {
  toInternational,
  whatsappLink,
  productEnquiryMessage,
  orderEnquiryMessage,
} from "@/lib/whatsapp";

describe("whatsapp helpers", () => {
  it("converts BD numbers to international format", () => {
    expect(toInternational("01712345678")).toBe("8801712345678");
    expect(toInternational("+8801712345678")).toBe("8801712345678");
    expect(toInternational("8801712345678")).toBe("8801712345678");
  });

  it("builds click-to-chat URLs with encoded messages", () => {
    const link = whatsappLink("01712345678", "Hello! Question about Aria Crossbody");
    expect(link).toContain("https://wa.me/8801712345678?text=");
    expect(decodeURIComponent(link.split("text=")[1])).toContain("Aria Crossbody");
  });

  it("product enquiries include name, SKU and link", () => {
    const msg = productEnquiryMessage({
      productName: "Aria Crossbody",
      sku: "CB-ARIA-ESPR",
      url: "https://example.com/products/aria-crossbody",
      variantName: "Espresso",
    });
    expect(msg).toContain("Aria Crossbody — Espresso");
    expect(msg).toContain("Ref: CB-ARIA-ESPR");
    expect(msg).toContain("https://example.com/products/aria-crossbody");
  });

  it("order enquiries include the reference", () => {
    const msg = orderEnquiryMessage({ reference: "CB-261116-3D1A01" });
    expect(msg).toContain("CB-261116-3D1A01");
  });
});
