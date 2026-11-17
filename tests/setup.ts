import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Allow importing server-only modules in unit tests
vi.mock("server-only", () => ({}));

// jsdom polyfills needed by cart persistence
if (typeof window !== "undefined") {
  if (!window.localStorage) {
    const store = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, v),
        removeItem: (k: string) => store.delete(k),
        clear: () => store.clear(),
        key: (i: number) => [...store.keys()][i] ?? null,
        get length() {
          return store.size;
        },
      },
    });
  }
  if (!window.crypto?.randomUUID) {
    Object.defineProperty(window, "crypto", {
      value: {
        ...window.crypto,
        randomUUID: () => "test-uuid-0000",
      },
    });
  }
}
