import { describe, expect, it, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { BagProvider, useBag, type BagLine } from "@/components/storefront/bag-context";
import React from "react";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BagProvider>{children}</BagProvider>
);

const line: Omit<BagLine, "quantity"> = {
  variantId: "v1",
  productId: "p1",
  slug: "aria-crossbody",
  name: "Aria Crossbody",
  variantName: "Espresso",
  sku: "CB-ARIA-ESPR",
  unitPrice: 6900,
  imageUrl: null,
  maxStock: 8,
};

describe("shopping bag", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds lines and computes totals", async () => {
    const { result } = renderHook(() => useBag(), { wrapper });
    // wait for hydration effect
    await act(async () => {});
    expect(result.current.count).toBe(0);

    act(() => result.current.addLine(line, 2));
    expect(result.current.count).toBe(2);
    expect(result.current.subtotal).toBe(13800);

    act(() => result.current.addLine({ ...line, variantId: "v2", unitPrice: 1900 }, 1));
    expect(result.current.count).toBe(3);
    expect(result.current.subtotal).toBe(15700);
  });

  it("merges duplicate variants and caps at 10", async () => {
    const { result } = renderHook(() => useBag(), { wrapper });
    await act(async () => {});
    act(() => result.current.addLine(line, 2));
    act(() => result.current.addLine(line, 2));
    expect(result.current.lines[0].quantity).toBe(4);
    act(() => result.current.addLine(line, 9));
    expect(result.current.lines[0].quantity).toBe(10);
  });

  it("updates quantities and removes lines", async () => {
    const { result } = renderHook(() => useBag(), { wrapper });
    await act(async () => {});
    act(() => result.current.addLine(line, 3));
    act(() => result.current.setQuantity("v1", 1));
    expect(result.current.count).toBe(1);
    act(() => result.current.setQuantity("v1", 0));
    expect(result.current.count).toBe(0);
    expect(result.current.lines).toHaveLength(0);
  });

  it("persists to localStorage", async () => {
    const { result } = renderHook(() => useBag(), { wrapper });
    await act(async () => {});
    act(() => result.current.addLine(line, 2));
    await act(async () => {});
    const stored = JSON.parse(window.localStorage.getItem("cb_bag_v1") ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].variantId).toBe("v1");
  });
});
