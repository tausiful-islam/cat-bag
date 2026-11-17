import { describe, expect, it } from "vitest";
import { formatBDT, isValidBDPhone, normalizeBDPhone, formatBDPhone, ORDER_STATUS_LABELS } from "@/lib/format";

describe("formatBDT", () => {
  it("formats whole taka amounts", () => {
    expect(formatBDT(12500)).toBe("৳12,500");
    expect(formatBDT(0)).toBe("৳0");
    expect(formatBDT(999999)).toBe("৳999,999");
  });
  it("accepts numeric strings from the database", () => {
    expect(formatBDT("6900")).toBe("৳6,900");
  });
  it("handles null gracefully", () => {
    expect(formatBDT(null)).toBe("৳—");
  });
});

describe("BD phone validation", () => {
  it("accepts valid national numbers", () => {
    expect(isValidBDPhone("01712345678")).toBe(true);
    expect(isValidBDPhone("01911223344")).toBe(true);
  });
  it("normalizes +880 to 01 form", () => {
    expect(normalizeBDPhone("+8801712345678")).toBe("01712345678");
    expect(normalizeBDPhone("8801712345678")).toBe("01712345678");
  });
  it("rejects invalid operators and lengths", () => {
    expect(isValidBDPhone("01112345678")).toBe(false); // 011 not a mobile prefix
    expect(isValidBDPhone("0171234567")).toBe(false); // too short
    expect(isValidBDPhone("017123456789")).toBe(false); // too long
  });
  it("formats for display", () => {
    expect(formatBDPhone("01712345678")).toBe("+880 171 234 5678");
  });
});

describe("order status labels", () => {
  it("covers every status used by the schema", () => {
    const statuses = ["pending_review", "confirmed", "processing", "dispatched", "delivered", "cancelled"];
    for (const s of statuses) {
      expect(ORDER_STATUS_LABELS[s]).toBeTruthy();
    }
  });
});
