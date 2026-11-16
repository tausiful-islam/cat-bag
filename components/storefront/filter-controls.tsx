"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatBDT } from "@/lib/format";

export interface Facets {
  colours: string[];
  materials: string[];
  priceMin: number;
  priceMax: number;
}

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const PRICE_STEPS = [0, 2000, 4000, 6000, 8000, 10000, 15000, 20000, 30000];

export function FilterControls({ facets, total }: { facets: Facets; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const activeColours = params.getAll("colour");
  const activeMaterials = params.getAll("material");
  const sort = params.get("sort") ?? "newest";
  const inStock = params.get("stock") === "1";
  const priceMin = params.get("min");
  const priceMax = params.get("max");
  const hasFilters =
    activeColours.length + activeMaterials.length > 0 || inStock || !!priceMin || !!priceMax;

  const toggleMulti = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    const current = next.getAll(key);
    next.delete(key);
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updated.forEach((v) => next.append(key, v));
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const body = (
    <div className="space-y-8">
      {facets.priceMax > 0 && (
        <div>
          <h4 className="eyebrow mb-3">Price</h4>
          <div className="flex flex-wrap gap-2">
            {priceBands(facets).map((band) => {
              const active = priceMin === String(band.min) && priceMax === String(band.max);
              return (
                <button
                  key={`${band.min}-${band.max}`}
                  type="button"
                  onClick={() =>
                    active
                      ? (setParam("min", null), setParam("max", null))
                      : (setParam("min", String(band.min)), setParam("max", String(band.max)))
                  }
                  className={`border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? "border-[var(--espresso)] bg-[var(--espresso)] text-[var(--ivory)]"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  {band.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {facets.colours.length > 0 && (
        <div>
          <h4 className="eyebrow mb-3">Colour</h4>
          <div className="flex flex-wrap gap-2">
            {facets.colours.map((c) => {
              const active = activeColours.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleMulti("colour", c)}
                  className={`border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? "border-[var(--espresso)] bg-[var(--espresso)] text-[var(--ivory)]"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {facets.materials.length > 0 && (
        <div>
          <h4 className="eyebrow mb-3">Material</h4>
          <div className="flex flex-wrap gap-2">
            {facets.materials.map((m) => {
              const active = activeMaterials.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMulti("material", m)}
                  className={`border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? "border-[var(--espresso)] bg-[var(--espresso)] text-[var(--ivory)]"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h4 className="eyebrow mb-3">Availability</h4>
        <button
          type="button"
          onClick={() => setParam("stock", inStock ? null : "1")}
          className={`border px-3 py-1.5 text-xs transition-colors ${
            inStock
              ? "border-[var(--espresso)] bg-[var(--espresso)] text-[var(--ivory)]"
              : "border-border hover:border-foreground/40"
          }`}
        >
          In stock only
        </button>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          <X className="h-3 w-3" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="sticky top-[104px] z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em]">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filter{hasFilters ? " •" : ""}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-lg">
            <SheetHeader className="text-left">
              <SheetTitle className="font-serif text-xl">Filter</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-8">{body}</div>
          </SheetContent>
        </Sheet>
        <span className="text-xs text-muted-foreground">{total} items</span>
        <SortSelect sort={sort} onChange={(v) => setParam("sort", v === "newest" ? null : v)} />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-32 space-y-8">
          <div className="flex items-baseline justify-between">
            <h3 className="eyebrow">Filter</h3>
            <span className="text-xs text-muted-foreground">{total} items</span>
          </div>
          {body}
          <div>
            <h4 className="eyebrow mb-3">Sort</h4>
            <SortSelect sort={sort} onChange={(v) => setParam("sort", v === "newest" ? null : v)} />
          </div>
        </div>
      </aside>
    </>
  );
}

function SortSelect({ sort, onChange }: { sort: string; onChange: (v: string) => void }) {
  return (
    <select
      aria-label="Sort products"
      value={sort}
      onChange={(e) => onChange(e.target.value)}
      className="border-none bg-transparent py-0 text-xs font-medium uppercase tracking-[0.12em] focus:outline-none"
    >
      {SORTS.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

function priceBands(facets: Facets): { min: number; max: number; label: string }[] {
  const top = Math.max(facets.priceMax, 1);
  const steps = PRICE_STEPS.filter((s) => s < top);
  const bands = steps.map((min) => {
    const nextStep = PRICE_STEPS.find((s) => s > min) ?? Math.ceil(top / 1000) * 1000;
    const max = Math.min(nextStep, Math.ceil(top / 1000) * 1000);
    return {
      min,
      max,
      label: min === 0 ? `Under ${formatBDT(max)}` : `${formatBDT(min)} – ${formatBDT(max)}`,
    };
  });
  bands.push({
    min: steps[steps.length - 1] ?? 0,
    max: 999999,
    label: `All prices`,
  });
  // dedupe by key
  const seen = new Set<string>();
  return bands.filter((b) => {
    const k = `${b.min}-${b.max}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
