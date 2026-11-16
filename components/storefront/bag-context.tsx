"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Shopping bag state — persisted to localStorage so it survives
 * navigation and refreshes. Quantities are validated again on the
 * server at order time; this is presentation state only.
 */

export interface BagLine {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  variantName: string | null;
  sku: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
  maxStock: number;
}

interface BagContextValue {
  lines: BagLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  addLine: (line: Omit<BagLine, "quantity">, qty?: number) => void;
  setQuantity: (variantId: string, qty: number) => void;
  removeLine: (variantId: string) => void;
  clear: () => void;
  idempotencyKey: string;
  renewIdempotencyKey: () => void;
}

const BagContext = createContext<BagContextValue | null>(null);
const STORAGE_KEY = "cb_bag_v1";
const IDEMPOTENCY_KEY = "cb_order_idem_v1";

function load(): BagLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l) => l && typeof l.variantId === "string" && typeof l.unitPrice === "number",
    );
  } catch {
    return [];
  }
}

export function BagProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<BagLine[]>([]);
  const [ready, setReady] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  useEffect(() => {
    setLines(load());
    setIdempotencyKey(
      window.localStorage.getItem(IDEMPOTENCY_KEY) ?? crypto.randomUUID(),
    );
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  useEffect(() => {
    if (ready && idempotencyKey) {
      window.localStorage.setItem(IDEMPOTENCY_KEY, idempotencyKey);
    }
  }, [idempotencyKey, ready]);

  const addLine = useCallback((line: Omit<BagLine, "quantity">, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.variantId === line.variantId);
      if (existing) {
        return prev.map((l) =>
          l.variantId === line.variantId
            ? { ...l, quantity: Math.min(10, l.quantity + qty) }
            : l,
        );
      }
      return [...prev, { ...line, quantity: Math.min(10, qty) }];
    });
  }, []);

  const setQuantity = useCallback((variantId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.variantId !== variantId)
        : prev.map((l) => (l.variantId === variantId ? { ...l, quantity: Math.min(10, qty) } : l)),
    );
  }, []);

  const removeLine = useCallback((variantId: string) => {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId));
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const renewIdempotencyKey = useCallback(() => setIdempotencyKey(crypto.randomUUID()), []);

  const value = useMemo<BagContextValue>(() => {
    const count = lines.reduce((s, l) => s + l.quantity, 0);
    const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    return {
      lines,
      count,
      subtotal,
      ready,
      addLine,
      setQuantity,
      removeLine,
      clear,
      idempotencyKey,
      renewIdempotencyKey,
    };
  }, [lines, ready, addLine, setQuantity, removeLine, clear, idempotencyKey, renewIdempotencyKey]);

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag(): BagContextValue {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error("useBag must be used within BagProvider");
  return ctx;
}
