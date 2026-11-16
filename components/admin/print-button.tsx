"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 border border-border bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] hover:border-foreground/30"
    >
      <Printer className="h-4 w-4" /> Print / Packing Slip
    </button>
  );
}
