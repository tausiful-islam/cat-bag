"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * Guest wishlist (localStorage). When Clerk + Supabase customer
 * accounts arrive, this syncs with the wishlists table; until then
 * it keeps working for every visitor.
 */

interface WishlistContextValue {
  ids: string[];
  ready: boolean;
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const KEY = "cb_wishlist_v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
      if (Array.isArray(parsed)) setIds(parsed.filter((x) => typeof x === "string"));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids, ready]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      ids,
      ready,
      has: (id) => ids.includes(id),
      toggle: (id) =>
        setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      remove: (id) => setIds((prev) => prev.filter((x) => x !== id)),
    }),
    [ids, ready],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
