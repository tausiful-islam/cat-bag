"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchInput({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
      }}
      className="flex items-center gap-3 border-b border-border pb-3"
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search handbags, styles, colours…"
        aria-label="Search products"
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        autoFocus
      />
    </form>
  );
}
